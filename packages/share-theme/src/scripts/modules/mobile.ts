import { syncSidebarState } from "./sidebar.js";

export default function setupMobileMenu() {
    const controller = new AbortController();
    let toggleToRestore: HTMLElement | null = null;

    function closeMobileMenus() {
        if (window.innerWidth > 768) return;
        const wasOpen = document.body.classList.contains("menu-open")
            || document.body.classList.contains("toc-open");
        if (!wasOpen) return;

        document.body.classList.remove("menu-open");
        document.body.classList.remove("toc-open");
        syncSidebarState();
        toggleToRestore?.focus();
        toggleToRestore = null;
    }

    for (const button of document.querySelectorAll<HTMLElement>(".header-button")) {
        button.addEventListener("click", () => {
            toggleToRestore = button;
        }, { signal: controller.signal });
    }

    window.addEventListener("click", e => {
        const isMenuOpen = document.body.classList.contains("menu-open");
        const isTocOpen = document.body.classList.contains("toc-open");
        if (!isMenuOpen && !isTocOpen) return;

        const target = e.target as HTMLElement;

        // If the click was anywhere in the mobile nav or TOC, don't close
        if (target.closest("#left-pane")) return;
        if (target.closest("#toc-pane")) return;

        // If the click was on one of the toggle buttons, the button's own listener will handle it
        if (target.closest(".header-button")) return;

        closeMobileMenus();
    }, { signal: controller.signal });

    window.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMobileMenus();
        } else if (event.key === "Tab") {
            trapDrawerFocus(event);
        }
    }, { signal: controller.signal });
    return () => controller.abort();
}

function trapDrawerFocus(event: KeyboardEvent) {
    if (window.innerWidth > 768) return;
    const paneId = document.body.classList.contains("menu-open")
        ? "left-pane"
        : document.body.classList.contains("toc-open") ? "toc-pane" : undefined;
    const pane = paneId ? document.getElementById(paneId) : null;
    if (!pane) return;

    const focusable = [...pane.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])"
    )];
    if (!focusable.length) {
        event.preventDefault();
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    } else if (!pane.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
    }
}
