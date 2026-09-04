import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const toolbarCss = readFileSync(join(__dirname, "mobile_editor_toolbar.css"), "utf-8");

describe("mobile editor toolbar", () => {
    it("tracks keyboard displacement without shrinking touch controls", () => {
        expect(toolbarCss).toContain("translateY(var(--tn-keyboard-gap, 0px))");
        expect(toolbarCss).toMatch(/\.classic-toolbar-widget \.ck\.ck-button \{[^}]*min-width: 44px;[^}]*min-height: 44px;/s);
        expect(toolbarCss).toContain("env(safe-area-inset-left)");
        expect(toolbarCss).toContain("@media (prefers-reduced-motion: reduce)");
    });
});
