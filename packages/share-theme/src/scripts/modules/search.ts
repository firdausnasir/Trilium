import debounce from "../common/debounce.js";
import parents from "../common/parents.js";
import parseHTML from "../common/parsehtml.js";
import type { default as Fuse } from "fuse.js";

let fuseInstance: Fuse<SearchResult> | null = null;

interface SearchResults {
    results: SearchResult[];
}

interface SearchResult {
    id: string;
    title: string;
    score?: number;
    path: string;
}

function buildResultItem(result: SearchResult) {
    const resultPath = (window as any).glob?.isStatic
        ? result.id
        : encodeURIComponent(result.id);
    return `<a class="search-result-item" href="./${escapeHtml(resultPath)}">
                <div class="search-result-title">${escapeHtml(result.title)}</div>
                <div class="search-result-note">${escapeHtml(result.path || getSearchInput()?.dataset.home || "")}</div>
            </a>`;
}

export default function setupSearch() {
    const searchInput: HTMLInputElement | null =
        document.querySelector(".search-input");
    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        debounce(async () => {
            const query = searchInput.value;
            if (query.length < 3) {
                closeResults();
                return;
            }

            try {
                const resp = await fetchResults(query);
                if (query !== searchInput.value) return;
                showResults(searchInput, resp.results.slice(0, 5));
            } catch {
                if (query !== searchInput.value) return;
                showResults(searchInput, [], searchInput.dataset.searchError);
            }
        }, 500),
    );

    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeResults();
            searchInput.focus();
        } else if (event.key === "ArrowDown") {
            const firstResult = document.querySelector<HTMLElement>(
                ".search-result-item",
            );
            if (firstResult) {
                event.preventDefault();
                firstResult.focus();
            }
        }
    });

    window.addEventListener("click", (e) => {
        const existing = document.querySelector(".search-results");
        if (!existing) return;
        // If the click was anywhere search components ignore it
        if (
            parents(e.target as HTMLElement, ".search-results,.search-item")
                .length
        )
            return;
        closeResults();
    });
}

function showResults(
    searchInput: HTMLInputElement,
    results: SearchResult[],
    status?: string,
) {
    const lines = [
        `<div id="search-results" class="search-results" role="region" aria-live="polite">`,
    ];
    for (const result of results) {
        lines.push(buildResultItem(result));
    }
    if (!results.length) {
        const message = escapeHtml(
            status ?? searchInput.dataset.noResults ?? "",
        );
        lines.push(
            `<div class="search-results-status" role="status">${message}</div>`,
        );
    }
    lines.push("</div>");

    const container = parseHTML(lines.join("")) as HTMLDivElement;
    const rect = searchInput.getBoundingClientRect();
    container.style.top = `${rect.bottom}px`;
    container.style.left = `${rect.left}px`;
    container.style.minWidth = `${rect.width}px`;

    const existing = document.querySelector(".search-results");
    if (existing) existing.replaceWith(container);
    else document.body.append(container);
    searchInput.setAttribute("aria-expanded", "true");

    container.addEventListener("keydown", (event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>(
            ".search-result-item",
        );
        if (!target) return;
        const results = [
            ...container.querySelectorAll<HTMLElement>(".search-result-item"),
        ];
        const index = results.indexOf(target);

        if (event.key === "Escape") {
            event.preventDefault();
            closeResults();
            searchInput.focus();
        } else if (event.key === "ArrowDown" && index < results.length - 1) {
            event.preventDefault();
            results[index + 1].focus();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (index === 0) searchInput.focus();
            else results[index - 1].focus();
        }
    });
}

function closeResults() {
    document.querySelector(".search-results")?.remove();
    document
        .querySelector(".search-input")
        ?.setAttribute("aria-expanded", "false");
}

function getSearchInput() {
    return document.querySelector<HTMLInputElement>(".search-input");
}

function escapeHtml(value: string) {
    return value.replace(
        /[&<>'"]/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
            })[character] ?? character,
    );
}

async function fetchResults(query: string): Promise<SearchResults> {
    const linkHref = document.head
        .querySelector("link[rel=stylesheet]")
        ?.getAttribute("href");
    const rootUrl = linkHref?.split("/").slice(0, -2).join("/") || ".";

    if ((window as any).glob.isStatic) {
        // Load the search index.
        if (!fuseInstance) {
            const searchIndex = await (
                await fetch(`${rootUrl}/search-index.json`)
            ).json();
            const Fuse = (await import("fuse.js")).default;
            fuseInstance = new Fuse(searchIndex, {
                keys: ["title", "content"],
                includeScore: true,
                threshold: 0.65,
                ignoreDiacritics: true,
                ignoreLocation: true,
                ignoreFieldNorm: true,
                useExtendedSearch: true,
            });
        }

        // Do the search.
        const results = fuseInstance.search(query, { limit: 5 });
        console.debug("Search results:", results);
        const processedResults = results.map(({ item, score }) => ({
            ...item,
            id: rootUrl + "/" + item.id,
            score,
        }));
        return { results: processedResults };
    } else {
        const ancestor = document.body.dataset.ancestorNoteId;
        const params = new URLSearchParams({
            search: query,
            ancestorNoteId: ancestor ?? "",
        });
        const resp = await fetch(`api/notes?${params}`);
        if (!resp.ok)
            throw new Error(`Search failed with status ${resp.status}`);
        return (await resp.json()) as SearchResults;
    }
}
