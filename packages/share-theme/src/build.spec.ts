import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

import { describe, expect, it } from "vitest";

const distPath = join(process.cwd(), "dist");
const stylesPath = join(process.cwd(), "src/styles");
const templatesPath = join(process.cwd(), "src/templates");

describe("share-theme build", () => {
    it("emits local fonts, licenses, and every asset referenced by CSS", () => {
        const files = readdirSync(distPath);
        expect(files).toContain("Montserrat-OFL.txt");
        expect(files).toContain("JetBrainsMono-OFL.txt");
        expect(
            files.some(
                (file) =>
                    file.startsWith("Montserrat-Light-") &&
                    file.endsWith(".woff2"),
            ),
        ).toBe(true);
        expect(
            files.some(
                (file) =>
                    file.startsWith("Montserrat-SemiBold-") &&
                    file.endsWith(".woff2"),
            ),
        ).toBe(true);
        expect(
            files.some(
                (file) =>
                    file.startsWith("JetBrainsMono-Light-") &&
                    file.endsWith(".woff2"),
            ),
        ).toBe(true);

        const styles = readFileSync(join(distPath, "styles.css"), "utf8");
        const referencedAssets = [...styles.matchAll(/url\(["']?([^"')]+)/g)]
            .map((match) => match[1])
            .filter((reference) => !reference.startsWith("data:"));
        for (const reference of referencedAssets) {
            const assetName = basename(reference.split(/[?#]/)[0]);
            expect(existsSync(join(distPath, assetName)), reference).toBe(true);
        }
    });

    it("keeps public mobile targets touch-sized", () => {
        const mobile = readFileSync(join(stylesPath, "mobile.css"), "utf8");
        const header = readFileSync(
            join(stylesPath, "navbar/header.css"),
            "utf8",
        );

        expect(mobile).toMatch(
            /\.header-button \{[^}]*width: 44px;[^}]*height: 44px;/s,
        );
        expect(mobile).toMatch(/\.collapse-button \{[^}]*min-width: 44px;/s);
        expect(header).toMatch(
            /\.switch \{[^}]*width: 48px;[^}]*height: 44px;/s,
        );
        expect(header).toMatch(/\.search-input \{[^}]*min-height: 44px;/s);
    });

    it("keeps web-view content on a definite full-height chain", () => {
        const content = readFileSync(join(stylesPath, "content.css"), "utf8");

        expect(content).toMatch(
            /\.article-canvas \{[^}]*height: 100%;[^}]*padding: 0;/s,
        );
    });

    it("uses logical spacing and direction-aware navigation", () => {
        const layout = readFileSync(join(stylesPath, "layout.css"), "utf8");
        const content = readFileSync(join(stylesPath, "content.css"), "utf8");
        const footer = readFileSync(
            join(stylesPath, "content-footer.css"),
            "utf8",
        );
        const navbar = readFileSync(
            join(stylesPath, "navbar/navbar.css"),
            "utf8",
        );

        expect(layout).toContain("border-inline-end: 1px solid");
        expect(layout).not.toContain("border-right:");
        expect(content).toContain("padding-inline-start: 1.4rem;");
        expect(footer).toContain(
            'html[dir="rtl"] #content-footer .navigation a.previous::before',
        );
        expect(footer).toContain(
            'html[dir="rtl"] #content-footer .navigation a.next::after',
        );
        expect(navbar).toMatch(
            /html\[dir="rtl"\] \.collapse-button \{[^}]*transform: rotate\(90deg\);/s,
        );
        expect(navbar).toMatch(
            /html\[dir="rtl"\] \.expanded > \.collapse-button,[^}]*transform: rotate\(0\);/s,
        );
    });

    it("keeps the public 404 card within the viewport", () => {
        const template = readFileSync(join(templatesPath, "404.ejs"), "utf8");

        expect(template).toContain("box-sizing: border-box;");
        expect(template).toContain('dir="<%= direction %>"');
    });
});
