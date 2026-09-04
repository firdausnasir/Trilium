import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(
    join(__dirname, "mobile_layout.tsx"),
    "utf-8",
);
const layoutCss = readFileSync(join(__dirname, "mobile_layout.css"), "utf-8");
const themeBaseCss = readFileSync(
    join(__dirname, "../stylesheets/theme-next/base.css"),
    "utf-8",
);
const tabSwitcherCss = readFileSync(
    join(__dirname, "../widgets/mobile_widgets/TabSwitcher.css"),
    "utf-8",
);
const setupCss = readFileSync(join(__dirname, "../setup.css"), "utf-8");
const loginCss = readFileSync(join(__dirname, "../login.css"), "utf-8");

describe("mobile Knowledge Studio shell", () => {
    it("keeps navigation, note frame, and launcher as distinct mobile regions", () => {
        expect(layoutSource).toContain("knowledge-studio-mobile-navigation");
        expect(layoutSource).toContain("knowledge-studio-mobile-note-bar");
        expect(layoutSource).toContain("knowledge-studio-mobile-content");
        expect(layoutSource).toContain("knowledge-studio-mobile-dock");
    });

    it("reserves safe areas and touch-sized shell controls", () => {
        expect(layoutCss).toContain("env(safe-area-inset-bottom)");
        expect(layoutCss).toContain("env(safe-area-inset-left)");
        expect(layoutCss).toContain("env(safe-area-inset-right)");
        expect(layoutCss).toMatch(
            /\.knowledge-studio-mobile-dock :is\([^)]+\) \{[^}]*min-width: 44px;[^}]*min-height: 44px;/s,
        );
        expect(layoutCss).toMatch(
            /\.knowledge-studio-mobile-note-bar \.note-icon \{[^}]*min-width: 44px;[^}]*min-height: 44px;/s,
        );
        expect(layoutCss).toMatch(
            /\.knowledge-studio-mobile-navigation > \.quick-search :is\(input, \.search-button\) \{[^}]*min-height: 44px;/s,
        );
        expect(layoutCss).toMatch(
            /\.knowledge-studio-mobile-navigation > \.quick-search \.search-button \{[^}]*width: 44px;[^}]*min-width: 44px;[^}]*height: 44px;/s,
        );
        expect(tabSwitcherCss).toContain("--icon-button-size: 44px;");
        expect(layoutCss).toContain("@media (prefers-reduced-motion: reduce)");
        expect(setupCss).toContain(
            "grid-template-rows: calc(76px + env(safe-area-inset-top)) minmax(0, 1fr);",
        );
        expect(loginCss).toContain(
            "grid-template-rows: calc(76px + env(safe-area-inset-top)) minmax(0, 1fr);",
        );
    });

    it("centers the non-Electron entry frame with a valid selector", () => {
        expect(setupCss).toContain(
            "body.setup:not(.electron) > .setup-outer-wrapper",
        );
        expect(setupCss).not.toContain("body:not(.electron) &");
    });

    it("keeps display typography under the configured main font", () => {
        expect(themeBaseCss).toContain(
            "--ks-display-font-family: var(--main-font-family);",
        );
    });

    it("centers the tab count independently of text direction", () => {
        expect(tabSwitcherCss).toContain("left: 50%;");
        expect(tabSwitcherCss).not.toContain("inset-inline-start: 50%;");
    });
});
