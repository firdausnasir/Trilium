/**
 * The ToC is now generated in the page template so
 * it even exists for users without client-side js
 * and that means it loads with the page so it avoids
 * all potential reshuffling or layout recalculations.
 *
 * So, all this function needs to do is make the links
 * perform smooth animation, and adjust the "active"
 * entry as the user scrolls.
 */
export default function setupToC() {
    const container = document.getElementById("right-pane");
    const toc = document.getElementById("toc");
    if (!toc || !container) return;
    const scrollContainer = container;

    // Get all relevant elements
    const content = document.getElementById("content");
    if (!content) return;
    const sections = content.querySelectorAll("h2, h3, h4, h5, h6");
    const links = toc.querySelectorAll("a");

    // Setup smooth scroll on click
    for (const link of links) {
        link.addEventListener("click", e => {
            const href = link.getAttribute("href");
            const target = href ? document.querySelector(href) : null;
            if (!target) return;
            e.preventDefault();
            e.stopPropagation();

            target.scrollIntoView({behavior: "smooth"});
        });
    }

    // Setup a moving "active" in the ToC that adjusts with the scroll state
    function changeLinkState() {
        let index = sections.length;

        // Work backwards to find the first matching section
        while (--index && scrollContainer.scrollTop + 50 < (sections[index] as HTMLElement).offsetTop) {} // eslint-disable-line no-empty

        // Update the "active" item in ToC
        for (const link of links) {
            link.classList.remove("active");
        }
        links[index]?.classList.add("active");
    }

    // Initial render
    changeLinkState();
    container.addEventListener("scroll", changeLinkState);
}
