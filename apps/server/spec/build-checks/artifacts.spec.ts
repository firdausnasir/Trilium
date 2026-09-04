import { existsSync, globSync, readFileSync, readdirSync } from "fs";
import { basename, join } from "path";
import { it, describe, expect } from "vitest";

describe("Check artifacts are present", () => {
    const distPath = join(__dirname, "../../dist");
    const sourceShareThemePath = join(__dirname, "../../../../packages/share-theme/dist");

    it("has the necessary node modules", async () => {
        const paths = [
            "node_modules/better-sqlite3",
            "node_modules/bindings",
            "node_modules/file-uri-to-path"
        ];

        ensurePathsExist(paths);
    });

    it("includes the client", async () => {
        const paths = [
            "public/assets",
            "public/fonts",
            "public/node_modules",
            "public/src",
            "public/stylesheets",
            "public/translations"
        ];

        ensurePathsExist(paths);
    });

    it("includes necessary assets", async () => {
        const paths = [
            "assets",
            "share-theme"
        ];

        ensurePathsExist(paths);
    });

    it("serves every built share-theme asset and all referenced fonts", () => {
        const servedShareThemePath = join(distPath, "share-theme/assets");
        expect(readdirSync(servedShareThemePath).sort()).toEqual(readdirSync(sourceShareThemePath).sort());

        const styles = readFileSync(join(servedShareThemePath, "styles.css"), "utf8");
        const referencedAssets = [...styles.matchAll(/url\(["']?([^"')]+)/g)]
            .map(match => match[1])
            .filter(reference => !reference.startsWith("data:"));
        for (const reference of referencedAssets) {
            const assetName = basename(reference.split(/[?#]/)[0]);
            expect(existsSync(join(servedShareThemePath, assetName)), reference).toBe(true);
        }

        expect(existsSync(join(servedShareThemePath, "Montserrat-OFL.txt"))).toBe(true);
        expect(existsSync(join(servedShareThemePath, "JetBrainsMono-OFL.txt"))).toBe(true);
    });

    function ensurePathsExist(paths: string[]) {
        for (const path of paths) {
            const result = globSync(join(distPath, path, "**"));
            expect(result, path).not.toHaveLength(0);
        }
    }
});
