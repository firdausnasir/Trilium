import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const repository = join(root, "../..");
const files = {
    prototypeHtml: join(root, "index.html"),
    prototypeCss: join(root, "styles.css"),
    prototypeJs: join(root, "app.js"),
    light: join(repository, "apps/client/src/stylesheets/theme-next-light.css"),
    dark: join(repository, "apps/client/src/stylesheets/theme-next-dark.css"),
    base: join(repository, "apps/client/src/stylesheets/theme-next/base.css"),
    studio: join(repository, "apps/client/src/stylesheets/theme-next/knowledge-studio.css")
};
const source = Object.fromEntries(Object.entries(files).map(([name, path]) => [name, readFileSync(path, "utf8")]));
const failures = [];

function check(condition, message) {
    if (!condition) failures.push(message);
}

const requiredStateIds = [
    ...Array.from({ length: 14 }, (_, index) => `NT-${String(index + 1).padStart(2, "0")}`),
    "SH-01-desktop", "SH-08-inspector", "SH-06-split", "SH-10-classic",
    "MB-01-mobile", "MB-01-mobile-nav", "MB-02-mobile-note", "MB-04-mobile-overlay",
    "EN-01-language", "EN-01-welcome", "EN-02-new", "EN-02-validation",
    "EN-03-existing", "EN-03-backup", "EN-03-progress", "EN-03-unlock",
    "EN-04-password", "EN-04-error", "EN-05-oidc", "EN-05-oidc-error",
    "setup-language", "setup-choice", "setup-existing", "setup-backup-options",
    "setup-backup-progress", "setup-backup-download", "setup-backup-complete", "setup-new",
    "setup-new-progress", "setup-sync-server", "setup-sync-discovery", "setup-sync-progress",
    "setup-sync-failure", "setup-restore-picker", "setup-restore-upload",
    "setup-restore-passphrase", "setup-restore-progress", "setup-targeted",
    "PB-01-root", "PB-02-article", "PB-03-search", "PB-04-mobile-nav",
    "PB-04-mobile-toc", "PB-02-rtl", "NT-03-grid", "NT-03-list", "NT-03-board",
    "NT-03-calendar", "KS-tokens", "KS-type", "KS-controls", "KS-roles",
    "KS-responsive", "KS-checks"
];
for (const id of requiredStateIds) check(source.prototypeJs.includes(`"${id}"`), `Missing state ID: ${id}`);
const registrySource = source.prototypeJs.split("const state =")[0];
const registeredStateIds = [...registrySource.matchAll(/\["([A-Za-z]+-[A-Za-z0-9-]+)",\s*"/g)].map((match) => match[1]);
check(registeredStateIds.length >= requiredStateIds.length, `Expected at least ${requiredStateIds.length} registered states, found ${registeredStateIds.length}`);
check(new Set(registeredStateIds).size === registeredStateIds.length, "Duplicate state ID found");

const allSource = Object.values(source).join("\n");
check(!/url\(\s*["']?https?:/i.test(allSource), "Remote font or asset URL found");
check(!/\b(editorial|ruled-paper)\b|(^|[,;\s])serif([,;\s]|$)|repeating-linear-gradient/im.test(allSource), "Rejected visual-language residue found");
check(!/transition\s*:\s*all\b/i.test(allSource), "Broad transition found");

for (const theme of ["light", "dark"]) {
    const imports = [...source[theme].matchAll(/@import\s+url\(([^)]+)\)/g)].map((match) => match[1]);
    check(new Set(imports).size === imports.length, `${theme} theme has duplicate imports`);
    check(imports.filter((value) => value.includes("knowledge-studio.css")).length === 1, `${theme} theme must import studio layer once`);
}

for (const token of [
    "--ks-shell-color", "--ks-canvas-color", "--ks-surface-color", "--ks-primary-color",
    "--ks-primary-soft-color", "--ks-attention-color", "--ks-attention-soft-color", "--ks-on-shell-color"
]) {
    check(source.light.includes(token), `Light theme missing ${token}`);
    check(source.dark.includes(token), `Dark theme missing ${token}`);
}
check(source.base.includes("--main-font-family") && source.base.includes("--detail-font-family"), "Existing font option variable contract missing");
check(source.studio.includes("var(--main-font-family)") && source.studio.includes("var(--detail-font-family)"), "Studio layer bypasses font option variables");

const fontFiles = [
    "apps/client/src/fonts/Inter/Inter-VariableFont_opsz,wght.woff2",
    "apps/client/src/fonts/Inter/OFL.txt",
    "apps/client/src/fonts/Montserrat-Light.woff2",
    "apps/client/src/fonts/Montserrat-SemiBold.woff2",
    "apps/client/src/fonts/Montserrat-OFL.txt",
    "apps/client/src/fonts/JetBrainsMono-Light.woff2",
    "apps/client/src/fonts/JetBrainsMono-OFL.txt"
];
for (const path of fontFiles) check(existsSync(join(repository, path)), `Missing local font asset or license: ${path}`);

function getThemeVariables(block) {
    return Object.fromEntries([...block.matchAll(/(--ks-[\w-]+):\s*(#[0-9a-f]{6});/gi)].map((match) => [match[1], match[2]]));
}

function luminance(hex) {
    const channels = hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16) / 255)
        .map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
}

function contrast(first, second) {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + .05) / (values[1] + .05);
}

const lightBlock = source.prototypeCss.match(/:root\s*{([\s\S]*?)\n}/)?.[1] ?? "";
const darkBlock = source.prototypeCss.match(/html\[data-theme="dark"\]\s*{([\s\S]*?)\n}/)?.[1] ?? "";
const contrastPairs = [
    ["light text/surface", getThemeVariables(lightBlock), "--ks-text", "--ks-surface", 4.5],
    ["light muted/surface", getThemeVariables(lightBlock), "--ks-text-muted", "--ks-surface", 4.5],
    ["light shell text", getThemeVariables(lightBlock), "--ks-on-shell", "--ks-shell", 4.5],
    ["light primary/surface", getThemeVariables(lightBlock), "--ks-primary", "--ks-surface", 4.5],
    ["light attention/surface", getThemeVariables(lightBlock), "--ks-attention", "--ks-surface", 4.5],
    ["dark text/surface", getThemeVariables(darkBlock), "--ks-text", "--ks-surface", 4.5],
    ["dark muted/surface", getThemeVariables(darkBlock), "--ks-text-muted", "--ks-surface", 4.5],
    ["dark shell text", getThemeVariables(darkBlock), "--ks-on-shell", "--ks-shell", 4.5],
    ["dark primary/canvas", getThemeVariables(darkBlock), "--ks-primary", "--ks-canvas", 4.5],
    ["dark attention/canvas", getThemeVariables(darkBlock), "--ks-attention", "--ks-canvas", 4.5]
];
const contrastReport = [];
for (const [name, variables, foreground, background, minimum] of contrastPairs) {
    check(Boolean(variables[foreground] && variables[background]), `Missing contrast colors: ${name}`);
    if (!variables[foreground] || !variables[background]) continue;
    const ratio = contrast(variables[foreground], variables[background]);
    check(ratio >= minimum, `${name} contrast ${ratio.toFixed(2)} is below ${minimum}`);
    contrastReport.push(`${name} ${ratio.toFixed(2)}:1`);
}

if (failures.length) {
    console.error(`Knowledge Studio check failed (${failures.length})`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log("Knowledge Studio check passed");
console.log(`State coverage: ${registeredStateIds.length} registered IDs; ${requiredStateIds.length} required IDs present`);
console.log("Fonts: local Inter Variable, Montserrat, and JetBrains Mono assets with OFL texts");
console.log(`Contrast: ${contrastReport.join("; ")}`);
console.log("Source rules: no remote URLs, rejected motifs, duplicate imports, or broad transitions");
console.log("Static limitation: browser-computed target sizes and screenshot acceptance require manual review");
