import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import setupMobileMenu from "./mobile.js";
import setupSearch from "./search.js";
import setupSidebars from "./sidebar.js";

let cleanups: (() => void)[] = [];

describe("public share navigation", () => {
    beforeEach(() => {
        cleanups = [];
        document.documentElement.className = "";
        document.body.className = "";
        document.body.innerHTML = `
            <a id="header-logo" href="./">Publication</a>
            <button id="left-pane-toggle-button" class="header-button">Navigation</button>
            <button id="toc-pane-toggle-button" class="header-button">Table of contents</button>
            <aside id="left-pane">
                <a href="#navigation">First note</a>
                <button type="button">Last navigation action</button>
            </aside>
            <aside id="toc-pane"><a href="#section">First section</a></aside>
            <main id="right-pane"><a href="#article">Article</a></main>
        `;
    });

    afterEach(() => {
        for (const cleanup of cleanups) cleanup();
        vi.restoreAllMocks();
    });

    it("synchronizes both drawers and their ARIA state on mobile", () => {
        setViewportWidth(600);
        cleanups.push(setupMobileMenu(), setupSidebars());
        const navigationButton = getElement("left-pane-toggle-button");
        const tocButton = getElement("toc-pane-toggle-button");

        expect(navigationButton.getAttribute("aria-expanded")).toBe("false");
        expect(getElement("left-pane").getAttribute("aria-hidden")).toBe(
            "true",
        );
        expect(getElement("left-pane").hasAttribute("inert")).toBe(true);

        navigationButton.click();
        expect(document.body.classList.contains("menu-open")).toBe(true);
        expect(navigationButton.getAttribute("aria-expanded")).toBe("true");
        expect(getElement("left-pane").getAttribute("aria-hidden")).toBe(
            "false",
        );
        expect(getElement("left-pane").hasAttribute("inert")).toBe(false);
        expect(getElement("right-pane").hasAttribute("inert")).toBe(true);
        expect(getElement("header-logo").hasAttribute("inert")).toBe(true);

        const navigationItems = [
            ...getElement("left-pane").querySelectorAll<HTMLElement>(
                "a, button",
            ),
        ];
        navigationItems[0].dispatchEvent(
            new KeyboardEvent("keydown", {
                key: "Tab",
                shiftKey: true,
                bubbles: true,
            }),
        );
        expect(document.activeElement).toBe(navigationItems[1]);
        navigationItems[1].dispatchEvent(
            new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
        );
        expect(document.activeElement).toBe(navigationItems[0]);

        tocButton.click();
        expect(document.body.classList.contains("menu-open")).toBe(false);
        expect(document.body.classList.contains("toc-open")).toBe(true);
        expect(navigationButton.getAttribute("aria-expanded")).toBe("false");
        expect(tocButton.getAttribute("aria-expanded")).toBe("true");
        expect(getElement("left-pane").getAttribute("aria-hidden")).toBe(
            "true",
        );
        expect(getElement("toc-pane").getAttribute("aria-hidden")).toBe(
            "false",
        );
        expect(getElement("left-pane").hasAttribute("inert")).toBe(true);
    });

    it("closes only an open mobile drawer on Escape", () => {
        setViewportWidth(600);
        cleanups.push(setupMobileMenu(), setupSidebars());
        const button = getElement("left-pane-toggle-button");
        button.click();
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(document.body.classList.contains("menu-open")).toBe(false);
        expect(button.getAttribute("aria-expanded")).toBe("false");
        expect(getElement("left-pane").getAttribute("aria-hidden")).toBe(
            "true",
        );
        expect(getElement("right-pane").hasAttribute("inert")).toBe(false);
        expect(getElement("header-logo").hasAttribute("inert")).toBe(false);
        expect(document.activeElement).toBe(button);

        setViewportWidth(1000);
        document.documentElement.classList.remove("left-pane-collapsed");
        button.setAttribute("aria-expanded", "true");
        getElement("left-pane").setAttribute("aria-hidden", "false");
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        expect(button.getAttribute("aria-expanded")).toBe("true");
        expect(getElement("left-pane").getAttribute("aria-hidden")).toBe(
            "false",
        );
    });
});

describe("public share search", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = `
            <div class="search-item">
                <input class="search-input" data-no-results="No results found"
                    data-search-error="Search is unavailable. Try again." data-home="Home"
                    aria-expanded="false">
            </div>
        `;
        Object.assign(window, { glob: { isStatic: false } });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("announces empty and failed searches", async () => {
        const input = getSearchInput();
        vi.stubGlobal(
            "fetch",
            vi
                .fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ results: [] }),
                })
                .mockResolvedValueOnce({ ok: false, status: 503 }),
        );
        setupSearch();

        await search(input, "empty");
        expect(document.querySelector("[role=status]")?.textContent).toBe(
            "No results found",
        );
        expect(input.getAttribute("aria-expanded")).toBe("true");

        await search(input, "failure");
        expect(document.querySelector("[role=status]")?.textContent).toBe(
            "Search is unavailable. Try again.",
        );
    });

    it("moves focus through results and returns it to the input", async () => {
        const input = getSearchInput();
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: () =>
                    Promise.resolve({
                        results: [
                            {
                                id: "docs/one?view#section",
                                title: "One",
                                path: "",
                            },
                            { id: "two", title: "Two", path: "Root" },
                        ],
                    }),
            }),
        );
        setupSearch();
        await search(input, "notes");
        const results = [
            ...document.querySelectorAll<HTMLElement>(".search-result-item"),
        ];
        expect(results[0].getAttribute("href")).toBe(
            "./docs%2Fone%3Fview%23section",
        );
        expect(
            results[0].querySelector(".search-result-note")?.textContent,
        ).toBe("Home");

        input.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
        );
        expect(document.activeElement).toBe(results[0]);
        results[0].dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
        );
        expect(document.activeElement).toBe(results[1]);
        results[1].dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
        );
        expect(document.activeElement).toBe(results[0]);
        results[0].dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
        );
        expect(document.activeElement).toBe(input);
        results[0].focus();
        results[0].dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
        expect(document.querySelector(".search-results")).toBeNull();
        expect(input.getAttribute("aria-expanded")).toBe("false");
        expect(document.activeElement).toBe(input);
    });

    it("preserves path separators in static export results", async () => {
        const stylesheet = document.createElement("link");
        stylesheet.setAttribute("href", "../assets/styles.css");
        vi.spyOn(document.head, "querySelector").mockReturnValue(stylesheet);
        Object.assign(window, { glob: { isStatic: true } });
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                json: () =>
                    Promise.resolve([
                        {
                            id: "guides/page.html",
                            title: "Guide",
                            content: "Static guide",
                            path: "Home / Guide",
                        },
                    ]),
            }),
        );
        const input = getSearchInput();
        setupSearch();

        await search(input, "guide");
        await vi.waitFor(() => {
            expect(
                document.querySelector(".search-result-item"),
            ).not.toBeNull();
        });

        expect(
            document.querySelector(".search-result-item")?.getAttribute("href"),
        ).toBe("./../guides/page.html");
    });
});

function getElement(id: string) {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing #${id}`);
    return element;
}

function getSearchInput() {
    const input = document.querySelector<HTMLInputElement>(".search-input");
    if (!input) throw new Error("Missing search input");
    return input;
}

function setViewportWidth(width: number) {
    Object.defineProperty(window, "innerWidth", {
        value: width,
        configurable: true,
    });
}

async function search(input: HTMLInputElement, query: string) {
    input.value = query;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(500);
}
