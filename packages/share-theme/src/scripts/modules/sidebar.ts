const MOBILE_BREAKPOINT = 768; // 48em

const SIDEBARS = [
    {
        buttonId: "left-pane-toggle-button",
        paneId: "left-pane",
        collapsedClass: "left-pane-collapsed",
        mobileClass: "menu-open"
    },
    {
        buttonId: "toc-pane-toggle-button",
        paneId: "toc-pane",
        collapsedClass: "toc-pane-collapsed",
        mobileClass: "toc-open"
    }
];

function setupToggle(sidebar: (typeof SIDEBARS)[number], signal: AbortSignal) {
    const button = document.getElementById(sidebar.buttonId);
    if (!button) return;
    button.setAttribute("aria-controls", sidebar.paneId);

    button.addEventListener("click", () => {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        if (isMobile) {
            document.body.classList.toggle(sidebar.mobileClass);
            for (const otherSidebar of SIDEBARS) {
                if (otherSidebar !== sidebar) document.body.classList.remove(otherSidebar.mobileClass);
            }
            const isOpen = document.body.classList.contains(sidebar.mobileClass);
            syncSidebarState();
            if (isOpen) {
                document.querySelector<HTMLElement>(`#${sidebar.paneId} a, #${sidebar.paneId} input`)?.focus();
            }
        } else {
            const isCollapsed = document.documentElement.classList.toggle(sidebar.collapsedClass);
            localStorage.setItem(sidebar.collapsedClass, String(isCollapsed));
            syncSidebarState();
        }
    }, { signal });
}

export default function setupSidebars() {
    const controller = new AbortController();
    for (const sidebar of SIDEBARS) setupToggle(sidebar, controller.signal);
    syncSidebarState();
    window.addEventListener("resize", () => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            for (const sidebar of SIDEBARS) document.body.classList.remove(sidebar.mobileClass);
        }
        syncSidebarState();
    }, { signal: controller.signal });
    return () => controller.abort();
}

export function syncSidebarState() {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const openMobileSidebar = isMobile
        ? SIDEBARS.find(sidebar => document.body.classList.contains(sidebar.mobileClass))
        : undefined;
    for (const sidebar of SIDEBARS) {
        const isOpen = isMobile
            ? document.body.classList.contains(sidebar.mobileClass)
            : !document.documentElement.classList.contains(sidebar.collapsedClass);
        document.getElementById(sidebar.buttonId)?.setAttribute("aria-expanded", String(isOpen));
        const pane = document.getElementById(sidebar.paneId);
        pane?.setAttribute("aria-hidden", String(!isOpen));
        pane?.toggleAttribute("inert", !isOpen);
    }
    document.getElementById("right-pane")?.toggleAttribute("inert", Boolean(openMobileSidebar));
    document.getElementById("header-logo")?.toggleAttribute("inert", Boolean(openMobileSidebar));
}
