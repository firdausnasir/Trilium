const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;

const noteStates = [
    ["NT-01", "Text notes"], ["NT-02", "Code and Markdown"], ["NT-03", "Collections"],
    ["NT-04", "Web and files"], ["NT-05", "Image"], ["NT-06", "Diagrams"],
    ["NT-07", "Maps"], ["NT-08", "Spreadsheet"], ["NT-09", "Icon pack"],
    ["NT-10", "Assistant"], ["NT-11", "Attachments"], ["NT-12", "Protected"],
    ["NT-13", "Render and widget"], ["NT-14", "Empty, docs, search"]
];

const entryStates = [
    ["EN-01-language", "Language"], ["EN-01-welcome", "Welcome"],
    ["EN-02-new", "New document"], ["EN-02-validation", "Validation"],
    ["EN-03-existing", "Existing server"], ["EN-03-backup", "Backup upload"],
    ["EN-03-progress", "Restore progress"], ["EN-03-unlock", "Restore passphrase"],
    ["EN-04-password", "Password + TOTP"], ["EN-04-error", "Password error"],
    ["EN-05-oidc", "OIDC login"], ["EN-05-oidc-error", "OIDC error"]
];

const setupStates = [
    ["setup-language", "Language"], ["setup-choice", "Initial choice"],
    ["setup-existing", "Existing-data decision"], ["setup-backup-options", "Backup parameters"],
    ["setup-backup-progress", "Backup progress"], ["setup-backup-download", "Backup download"],
    ["setup-backup-complete", "Backup complete"], ["setup-new", "New document choice"],
    ["setup-new-progress", "New document progress"], ["setup-sync-server", "Sync server form"],
    ["setup-sync-discovery", "Sync desktop discovery"], ["setup-sync-progress", "Sync progress"],
    ["setup-sync-failure", "Sync failure"], ["setup-restore-picker", "Restore picker"],
    ["setup-restore-upload", "Restore upload"], ["setup-restore-passphrase", "Restore passphrase"],
    ["setup-restore-progress", "Restore progress"], ["setup-targeted", "Targeted backup"]
];

const publicStates = [
    ["PB-01-root", "Public root"], ["PB-02-article", "Public article"],
    ["PB-03-search", "Public search"], ["PB-04-mobile-nav", "Mobile navigation"],
    ["PB-04-mobile-toc", "Mobile ToC"], ["PB-02-rtl", "RTL article"]
];

const workspaceStates = [
    ["SH-01-desktop", "Desktop studio"], ["SH-08-inspector", "Inspector open"],
    ["SH-06-split", "Split notes"], ["SH-10-classic", "Classic compatibility"],
    ["MB-01-mobile", "Mobile workspace"], ["MB-01-mobile-nav", "Mobile navigation"],
    ["MB-02-mobile-note", "Mobile note"], ["MB-04-mobile-overlay", "Mobile overlay"]
];

const settingsStates = [
    ["SET-01", "Appearance"], ["SET-02", "Localization"], ["SET-03", "Shortcuts"],
    ["SET-04", "Desktop"], ["SET-05", "Text notes"], ["SET-06", "Code notes"],
    ["SET-07", "Media"], ["SET-08", "Content manager"], ["SET-09", "Spellcheck"],
    ["SET-10", "LLM"], ["SET-11", "Sync"], ["SET-12", "ETAPI"],
    ["SET-13", "Backup"], ["SET-14", "Database"], ["SET-15", "Security"],
    ["SET-16", "Password and sign-in"], ["SET-17", "Other"], ["SET-18", "Advanced"]
];

const dialogStates = [
    ["MOD-01", "Navigation and editors"], ["MOD-02", "Note organization"],
    ["MOD-03", "Deletion and history"], ["MOD-04", "Import and export"],
    ["MOD-05", "Attachments and content"], ["MOD-06", "Attributes and languages"],
    ["MOD-07", "Security gates"], ["MOD-08", "Bulk operations"],
    ["MOD-09", "Printing"], ["MOD-10", "Help and about"],
    ["MOD-11", "Confirm"], ["MOD-12", "Prompt"], ["MOD-13", "Information"],
    ["MOD-14", "Startup action"], ["MOD-15", "Toasts and shortcut hints"]
];

const registry = [
    { id: "workspace", label: "Workspace", group: "Studio", icon: "mark", states: workspaceStates },
    { id: "notes", label: "Note surfaces", group: "Studio", icon: "note", states: noteStates },
    { id: "collections", label: "Collections", group: "Studio", icon: "grid", states: [["NT-03-grid", "Grid"], ["NT-03-list", "List"], ["NT-03-board", "Board"], ["NT-03-calendar", "Calendar"]] },
    { id: "entry", label: "Entry", group: "Journeys", icon: "lock", states: entryStates },
    { id: "setup", label: "Setup", group: "Journeys", icon: "tree", states: setupStates },
    { id: "public", label: "Public", group: "Publication", icon: "globe", states: publicStates },
    { id: "settings", label: "Settings", group: "System", icon: "mark", states: settingsStates },
    { id: "dialogs", label: "Dialogs", group: "System", icon: "grid", states: dialogStates },
    { id: "print", label: "Print", group: "System", icon: "note", states: [["PR-01", "Print note"]] },
    { id: "foundations", label: "Foundations", group: "Contract", icon: "grid", states: [["KS-tokens", "Semantic tokens"], ["KS-type", "Font roles"], ["KS-controls", "Controls"]] },
    { id: "contract", label: "Contract", group: "Contract", icon: "note", states: [["KS-roles", "Role matrix"], ["KS-responsive", "Responsive composition"], ["KS-checks", "Acceptance checks"]] }
];

const state = {
    page: "workspace",
    stateId: "SH-01-desktop",
    viewport: "desktop",
    theme: "light",
    query: "",
    mobileNavOpen: false
};

const preview = document.querySelector("#preview");
const pageNav = document.querySelector("#page-nav");

function renderNav() {
    let lastGroup = "";
    const query = state.query.toLowerCase();
    pageNav.innerHTML = registry.filter((page) => !query || page.label.toLowerCase().includes(query)
        || page.states.some(([, label]) => label.toLowerCase().includes(query))).map((page) => {
        const group = page.group === lastGroup ? "" : `<div class="nav-label">${page.group}</div>`;
        lastGroup = page.group;
        return `${group}<button class="page-link ${page.id === state.page ? "is-active" : ""}" data-page="${page.id}">${icon(page.icon)}<span>${page.label}</span><small>${page.states.length}</small></button>`;
    }).join("");
}

function stateTabs(states) {
    return `<div class="state-tabs" role="tablist">${states.map(([id, label]) => `<button role="tab" class="${id === state.stateId ? "is-active" : ""}" aria-selected="${id === state.stateId}" data-state="${id}">${label}</button>`).join("")}</div>`;
}

function render() {
    document.documentElement.dataset.theme = state.theme;
    preview.className = `preview preview-${state.viewport}`;
    const page = registry.find((item) => item.id === state.page) || registry[0];
    document.querySelector("#page-title").textContent = page.label;
    document.querySelector("#theme-toggle span").textContent = state.theme === "light" ? "Dark" : "Light";
    document.querySelectorAll("[data-viewport]").forEach((button) => {
        const active = button.dataset.viewport === state.viewport;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
    });
    const renderers = {
        workspace: renderWorkspace,
        notes: renderNotes,
        collections: renderCollections,
        entry: renderEntry,
        setup: renderSetup,
        public: renderPublic,
        settings: renderSettings,
        dialogs: renderDialogs,
        print: renderPrint,
        foundations: renderFoundations,
        contract: renderContract
    };
    preview.innerHTML = renderers[page.id]();
    renderNav();
    bindPreview();
}

function screenHead(index, title, copy) {
    return `<header class="screen-head"><div><span class="index-label">${index}</span><h2>${title}</h2></div><p>${copy}</p></header>`;
}

function renderWorkspace() {
    const mobile = state.stateId.startsWith("MB-");
    if (mobile) state.viewport = "mobile";
    const navOpen = state.stateId === "MB-01-mobile-nav" || state.mobileNavOpen;
    const tree = ["Studio inbox", "Field research", "Penang routes", "Quarterly review", "Library", "Archive"];
    return `<section class="screen">${stateTabs(workspaceStates)}<div class="workspace">
        <header class="workspace-bar"><button data-mobile-nav aria-label="Open navigation">${icon("menu")}</button><span class="workspace-brand">Trilium / Studio</span><input class="workspace-search" aria-label="Quick search" placeholder="Search notes, labels, commands"><span class="workspace-spacer"></span><button data-toast="Capture opened" aria-label="Quick capture">+</button><button data-toast="Sync current" aria-label="Sync status">Sync</button></header>
        <div class="workspace-grid"><aside class="studio-nav ${navOpen ? "is-open" : ""}"><div class="panel-head"><span>Knowledge map</span><button class="icon-action" data-toast="New note" aria-label="New note">+</button></div><div class="tree-list">${tree.map((item, index) => `<button class="tree-item ${index > 1 && index < 4 ? "depth" : ""} ${index === 2 ? "is-active" : ""}">${icon(index === 0 || index === 4 || index === 5 ? "grid" : "note")}${item}</button>`).join("")}</div><div class="studio-launcher"><button aria-label="Notes">${icon("tree")}</button><button aria-label="Search">${icon("search")}</button><button aria-label="New note">+</button><button aria-label="Menu">${icon("mark")}</button></div></aside>
        <main class="note-frame"><div class="tabs"><button class="tab">Quarterly review</button><button class="tab is-active">Penang routes</button><button class="tab">Reading queue</button></div><header class="note-head"><span class="status good">Synced</span><h2>Penang routes</h2><div class="action-row"><button class="icon-action" aria-label="Favorite">Star</button><button class="icon-action" data-toast="Note menu opened" aria-label="Note menu">${icon("menu")}</button></div></header><div class="note-content"><article><span class="index-label">Field research / 042</span><h1>Shade is city infrastructure.</h1><p class="lead">A working record of streets, meals, and ideas gathered between rainstorms.</p><h3>Five-foot ways</h3><p>Old shophouses reward slower attention. Each threshold edits street life without closing it, making private frontage part of a continuous civic room.</p><blockquote>Keep map sparse. Record only places worth returning to, then connect each place to people and projects it touched.</blockquote><div class="status-row"><span class="status">#travel</span><span class="status">#observation</span></div></article></div></main>
        <aside class="inspector"><div class="panel-head"><span>Context / attributes</span><button class="icon-action" aria-label="Close inspector">${icon("close")}</button></div><div class="inspector-card"><div class="property"><span>Type</span><strong>Text</strong></div><div class="property"><span>Created</span><strong>28 Aug 2026</strong></div><div class="property"><span>Words</span><strong>428</strong></div><div class="property"><span>Links</span><strong>12 incoming</strong></div></div></aside></div>
        <nav class="mobile-dock" aria-label="Mobile workspace"><button data-mobile-nav>${icon("tree")}<span>Notes</span></button><button>${icon("search")}<span>Search</span></button><button><span>+</span><span>New</span></button><button>${icon("mark")}<span>Context</span></button></nav>
    </div></section>`;
}

function renderNotes() {
    const selected = noteStates.find(([id]) => id === state.stateId) || noteStates[0];
    const [id, label] = selected;
    const visual = id === "NT-02" ? `<div class="code-block">export async function connectIdeas(noteId) {\n    const note = await api.getNote(noteId);\n    return note.getRelations("supports");\n}</div>`
        : ["NT-06", "NT-07", "NT-13"].includes(id) ? `<div class="demo-canvas"><div class="demo-node">Question</div><div class="demo-node">Evidence</div><div class="demo-node">Decision</div></div>`
        : id === "NT-08" ? `<div class="data-grid"><strong>Project</strong><strong>Owner</strong><strong>Status</strong><span>Search refresh</span><span>Amina</span><span>Active</span><span>Mobile capture</span><span>Firdaus</span><span>Review</span></div>`
        : id === "NT-12" ? `<article class="card attention"><span class="status warn">Locked</span><h3>Protected note</h3><p>Title, content, and attributes remain concealed.</p><button class="button">Unlock session</button></article>`
        : `<div class="two-col"><article><h3>Working surface</h3><p>Content gets broad measure and quiet hierarchy. Controls stay compact, explicit, and close to action.</p><p>Custom content fonts remain controlled by Trilium font options.</p></article><aside class="card featured"><span class="index-label">Context</span><h3>${label}</h3><p>Representative anatomy for ${id}.</p></aside></div>`;
    return `<section class="screen">${stateTabs(noteStates)}${screenHead(id, label, "Every note family receives same canvas hierarchy without leaking shell styling into specialized editors.")}<div class="gallery"><aside class="gallery-nav"><input class="search-input" placeholder="Filter note families">${noteStates.map(([noteId, name]) => `<button class="${noteId === id ? "is-active" : ""}" data-state="${noteId}">${noteId} / ${name}</button>`).join("")}</aside><main class="gallery-main"><div class="note-demo"><span class="index-label">${id} / private surface</span><h2>${label}</h2>${visual}<div class="action-row"><button class="button" data-toast="Primary action complete">Primary action</button><button class="button secondary">More</button></div></div></main></div></section>`;
}

function renderCollections() {
    const modes = registry.find((page) => page.id === "collections").states;
    const selected = modes.find(([id]) => id === state.stateId) || modes[0];
    return `<section class="screen">${stateTabs(modes)}${screenHead(selected[0], "Field research collection", "Useful asymmetry makes featured material dominant without turning every item into same card.")}<div class="content-pad"><div class="collection-grid"><article class="card featured"><span class="index-label">Featured path</span><h3>George Town on foot</h3><p>Six connected notes across shade, food, weather, and public space.</p></article>${["Five-foot ways", "Market soundscape", "Rain routes", "Return list"].map((title, index) => `<article class="card"><span class="index-label">0${index + 1}</span><h3>${title}</h3><p>Updated ${index + 1}d ago</p></article>`).join("")}</div></div></section>`;
}

function renderEntry() {
    const selected = entryStates.find(([id]) => id === state.stateId) || entryStates[8];
    const [id, label] = selected;
    const failed = id.includes("error") || id.includes("validation");
    const oidc = id.includes("oidc");
    return `<section class="screen">${stateTabs(entryStates)}<div class="auth-shell"><aside class="auth-signal"><div><span class="index-label">Private by design</span><h2>Knowledge stays in your hands.</h2><p>Local-first notes with structure that grows at your pace.</p></div><div class="signal-bars"><span></span><span></span><span></span></div></aside><main class="auth-main"><form class="auth-panel" onsubmit="return false"><span class="index-label">${id}</span><h1>${label}</h1><p>${failed ? "Request stopped safely. Notes and credentials remain unchanged." : "Continue into private workspace without sacrificing context or control."}</p>${failed ? `<div class="card attention"><strong>Could not verify request</strong><p>Check credentials or provider response, then try again.</p></div>` : oidc ? `<button class="button">Continue with Northstar SSO</button>` : `<div class="stack"><label class="field"><span>Password</span><input type="password" placeholder="Enter securely"></label><label class="field"><span>Authenticator code</span><input inputmode="numeric" placeholder="000 000"></label></div>`}<div class="auth-actions"><button class="button secondary">Alternative method</button><button class="button">Continue</button></div></form></main></div></section>`;
}

function renderSetup() {
    const selected = setupStates.find(([id]) => id === state.stateId) || setupStates[0];
    const [id, label] = selected;
    const progress = id.includes("progress");
    const failed = id.includes("failure");
    return `<section class="screen setup-shell"><aside class="setup-map"><span class="index-label">Document setup</span><h2>Build studio</h2><div class="setup-progress">${setupStates.map(([stepId, name], index) => `<button class="${stepId === id ? "is-active" : ""}" data-state="${stepId}"><span>${String(index + 1).padStart(2, "0")}</span>${name}</button>`).join("")}</div></aside><main class="setup-main"><div class="setup-step"><span class="index-label">${id}</span><h1>${label}</h1><p>Make one clear decision at a time. Existing data stays untouched until confirmation.</p>${failed ? `<div class="card attention"><span class="status warn">Connection stopped</span><h3>Nothing was applied</h3><p>SYNC_TLS_HANDSHAKE / notes.home.arpa</p></div>` : progress ? `<div class="card"><span class="status good">Checksums current</span><h3>Verifying encrypted entities</h3><div class="progress-track"><span></span></div><p>12,408 of 18,211 items</p></div>` : `<div class="choice-list"><button class="choice is-active"><span><strong>Recommended path</strong><small>Preserve history and continue safely</small></span><span class="index-label">01</span></button><button class="choice"><span><strong>Alternative path</strong><small>Review details before continuing</small></span><span class="index-label">02</span></button></div>`}<div class="setup-actions"><button class="button secondary">Back</button><button class="button">Continue</button></div></div></main></section>`;
}

function renderPublic() {
    const selected = publicStates.find(([id]) => id === state.stateId) || publicStates[0];
    const [id] = selected;
    const search = id === "PB-03-search";
    const article = id !== "PB-01-root" && !search;
    const sheet = id === "PB-04-mobile-nav" ? "nav" : id === "PB-04-mobile-toc" ? "toc" : "";
    if (sheet) state.viewport = "mobile";
    const body = search ? `<main class="public-search"><span class="index-label">Search publication</span><h1>Results for Penang</h1><label class="field"><span>Search shared notes</span><input value="Penang"></label>${["Penang routes", "Five-foot ways", "Rain map"].map((title, index) => `<article class="search-result"><span class="index-label">0${index + 1}</span><div><strong>${title}</strong><p class="muted">Field research / matching excerpt and linked context.</p></div><span>Open -></span></article>`).join("")}</main>`
        : article ? `<main class="public-article" ${id === "PB-02-rtl" ? "dir=\"rtl\"" : ""}><article><span class="index-label">Field note / 03 Sep 2026</span><h1>Shade is city infrastructure.</h1><p class="muted">A public field note from George Town, Penang.</p><p>Five-foot ways create continuity between commerce and street. Their value is ordinary, cumulative, and clearest during afternoon rain.</p><h2 id="thresholds">Thresholds</h2><p>Each threshold makes private frontage participate in public movement without erasing its boundary.</p><blockquote>Design records become useful when observation and consequence stay connected.</blockquote><h2 id="routes">Routes forward</h2><p>Next reading: markets, rain paths, and return visits.</p></article><aside class="toc"><span class="index-label">On this page</span><a href="#thresholds">Thresholds</a><a href="#routes">Routes forward</a><a href="#links">Linked notes</a></aside></main>`
        : `<section class="public-hero"><div><span class="index-label">Public research collection</span><h1>City, climate, threshold.</h1></div><p>Field notes from George Town. Observations stay connected to routes, images, and decisions.</p></section><main class="public-root-grid"><article class="card featured"><span class="index-label">Start here</span><h2>Five-foot ways</h2><p>How continuous shade turns private frontage into shared infrastructure.</p><button class="button" data-state="PB-02-article">Read field note</button></article>${["Rain routes", "Market soundscape", "Return list", "Street shade study"].map((title) => `<article class="card"><h3>${title}</h3><p>Field note / 6 min</p></article>`).join("")}</main>`;
    return `<section class="screen">${stateTabs(publicStates)}<div class="public-shell"><header class="public-masthead"><span class="public-name">Field Office / Penang</span><nav><a href="#">Index</a><a href="#">About</a><a href="#">Archive</a></nav><div class="action-row"><button class="icon-action" data-state="PB-03-search" aria-label="Search publication">${icon("search")}</button><button class="icon-action" data-public-sheet="nav" aria-label="Open navigation">${icon("menu")}</button></div></header>${body}${sheet ? `<aside class="mobile-sheet"><span class="index-label">${sheet === "nav" ? "Publication navigation" : "On this page"}</span>${sheet === "nav" ? `<nav><a href="#">Index</a><a href="#">Field notes</a><a href="#">Routes</a><a href="#">About</a></nav>` : `<div class="toc"><a href="#">Thresholds</a><a href="#">Routes forward</a><a href="#">Linked notes</a></div>`}</aside>` : ""}</div></section>`;
}

function renderSettings() {
    const selected = settingsStates.find(([id]) => id === state.stateId) || settingsStates[0];
    return `<section class="screen">${stateTabs(settingsStates)}${screenHead(selected[0], selected[1], "Searchable configuration keeps effect and consequence together.")}<div class="gallery"><aside class="gallery-nav"><input class="search-input" placeholder="Search settings">${settingsStates.map(([id, label]) => `<button class="${id === selected[0] ? "is-active" : ""}" data-state="${id}">${label}</button>`).join("")}</aside><main class="gallery-main"><div class="note-demo"><span class="index-label">${selected[0]} / configuration</span><h2>${selected[1]}</h2><div class="stack"><div class="contract-row"><div><strong>Primary preference</strong><p class="muted">Synced across devices. Existing content stays unchanged.</p></div><label class="field"><span>Value</span><select><option>System default</option><option>Enabled</option><option>Disabled</option></select></label></div><div class="contract-row"><div><strong>Supporting option</strong><p class="muted">Advanced detail remains visible without extra nesting.</p></div><label class="field"><span>Value</span><input value="Automatic"></label></div></div><div class="auth-actions"><button class="button secondary">Reset section</button><button class="button">Save changes</button></div></div></main></div></section>`;
}

function renderDialogs() {
    const selected = dialogStates.find(([id]) => id === state.stateId) || dialogStates[0];
    return `<section class="screen">${stateTabs(dialogStates)}${screenHead(selected[0], "Dialogs and feedback", "Interrupt only for decisions requiring focused context or explicit consequence.")}<div class="content-pad three-col">${dialogStates.map(([id, label], index) => `<article class="card ${id === selected[0] ? "featured" : ""} ${index === 2 ? "attention" : ""}"><span class="index-label">${id}</span><h3>${label}</h3><p>Clear title, concise consequence, safe dismissal, and one primary action.</p><button class="button compact ${index === 2 ? "attention" : "secondary"}" data-state="${id}">Preview state</button></article>`).join("")}</div></section>`;
}

function renderPrint() {
    return `<section class="screen">${stateTabs([["PR-01", "Print note"]])}<article class="public-article"><article><span class="index-label">Print / provenance included</span><h1>Shade is city infrastructure.</h1><p class="muted">Field research / George Town / 3 September 2026</p><p>Five-foot ways create continuity between commerce and street. Print output removes workspace chrome while preserving hierarchy, source context, links, and readable sans typography.</p><h2>Working observations</h2><ol><li>Map only places worth returning to.</li><li>Connect evidence directly to decisions.</li><li>Retain dates and source paths.</li></ol></article><aside class="toc"><span class="index-label">Output</span><p>A4 / links visible</p><button class="button compact">Print</button></aside></article></section>`;
}

function renderFoundations() {
    const states = registry.find((page) => page.id === "foundations").states;
    return `<section class="screen">${stateTabs(states)}${screenHead("KS-1", "Knowledge Studio system", "Graphite chrome frames luminous neutral canvases. Cobalt carries interaction; coral marks attention, never decoration.")}<div class="content-pad stack"><div class="token-grid"><div class="token shell">Graphite shell</div><div class="token canvas">Neutral canvas</div><div class="token surface">Raised surface</div><div class="token primary">Cobalt primary</div><div class="token attention">Coral attention</div><div class="token muted">Quiet chrome</div></div><div class="two-col"><article class="card featured"><span class="index-label">Display / Montserrat</span><h3>Structured, not ornamental.</h3><p>Light and semibold weights create decisive hierarchy in chrome and reference surfaces.</p></article><article class="card"><span class="index-label">Interface and reading / Inter Variable</span><h3>One crisp sans system</h3><p>Product defaults use existing main and detail font variables. User font options remain authoritative. JetBrains Mono handles IDs, code, and compact metadata.</p></article></div><div class="action-row"><button class="button">Primary action</button><button class="button secondary">Secondary</button><button class="button attention">Needs attention</button><span class="status good">Synced</span></div></div></section>`;
}

function renderContract() {
    const states = registry.find((page) => page.id === "contract").states;
    return `<section class="screen">${stateTabs(states)}${screenHead("KS-1 / contract", "Roles and composition", "Shared role names guide private and public implementations without coupling runtime CSS.")}<div class="content-pad contract-grid"><article class="card"><span class="index-label">Semantic role matrix</span>${[["Shell", "Graphite global and navigation chrome"], ["Canvas", "Luminous content field"], ["Primary", "Cobalt selection, links, focus, actions"], ["Attention", "Coral errors, warnings, and emphasis"], ["Display", "Montserrat on structural headings only"], ["Content", "Existing detail font variable"]].map(([term, copy]) => `<div class="contract-row"><strong>${term}</strong><span>${copy}</span></div>`).join("")}</article><article class="card featured"><span class="index-label">Responsive composition</span><h3>Desktop</h3><p>Compact 206px navigator, dominant offset canvas, narrower 286px inspector. Rails differ in purpose and visual weight.</p><h3>Mobile</h3><p>Single content plane, 44px minimum controls, bottom dock, and focused navigation or ToC sheets.</p><h3>Static limits</h3><p>Checker validates registry, source constraints, font paths, tokens, and contrast. Browser layout size and screenshot acceptance remain manual.</p></article></div></section>`;
}

function bindPreview() {
    preview.querySelectorAll("[data-state]").forEach((button) => button.addEventListener("click", () => {
        state.stateId = button.dataset.state;
        const owner = registry.find((page) => page.states.some(([id]) => id === state.stateId));
        if (owner) state.page = owner.id;
        state.viewport = state.stateId.startsWith("MB-") || state.stateId.includes("mobile") ? "mobile" : "desktop";
        state.mobileNavOpen = false;
        render();
    }));
    preview.querySelector("[data-mobile-nav]")?.addEventListener("click", () => {
        state.mobileNavOpen = !state.mobileNavOpen;
        render();
    });
    preview.querySelectorAll("[data-toast]").forEach((button) => button.addEventListener("click", () => showToast(button.dataset.toast)));
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.querySelector("#toast-region").replaceChildren(toast);
    window.setTimeout(() => toast.remove(), 2600);
}

document.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");
    if (!pageButton) return;
    state.page = pageButton.dataset.page;
    state.stateId = registry.find((page) => page.id === state.page).states[0][0];
    state.viewport = "desktop";
    render();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        document.querySelector("#global-search").focus();
    }
});

document.querySelector("#global-search").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderNav();
});

document.querySelectorAll("[data-viewport]").forEach((button) => button.addEventListener("click", () => {
    state.viewport = button.dataset.viewport;
    render();
}));

document.querySelector("#theme-toggle").addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    render();
});

document.querySelector("#state-count").textContent = `${registry.reduce((total, page) => total + page.states.length, 0)} states`;
render();
