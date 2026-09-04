# Knowledge Studio Redesign

## Task 1: Establish Visual Contract And Reference

**Objective:** Replace the rejected editorial direction with an implementation-ready Knowledge Studio reference covering private and public surfaces.

**Context:** Current `design-artifacts/trilium-redesign` and `editorial.css` preserve too much old structure. Design must visibly use graphite chrome, luminous content, cobalt interaction, coral attention, sans-led typography, balanced density, and useful asymmetry.

**Inputs / dependencies:** Approved PRD; existing prototype; authenticated and share-theme architecture maps.

**Parallelizable:** No.

**Isolation boundary:** `design-artifacts/trilium-redesign/**`; selected font assets and license files; `apps/client/src/stylesheets/theme-next-light.css`, `theme-next-dark.css`, `theme-next/base.css`, `theme-next/editorial.css`; new shared token/font CSS under `theme-next/`. No shell component files.

**Steps:**
1. Select OFL-compatible variable UI and reading fonts with Latin coverage and required weights.
2. Replace prototype visual system and core screens for desktop workspace, mobile workspace, setup/login, public root, public article, search, ToC, and mobile drawer.
3. Document semantic role matrix and responsive composition in prototype.
4. Remove serif and ruled-paper motifs.
5. Replace `editorial.css` atomically: delete or fully repurpose it, update both light/dark imports, and make one token/base layer authoritative. Add a static check that rejects old editorial selectors, ruled-paper declarations, duplicate theme imports, and remote font URLs.

**Acceptance criteria:** Prototype satisfies PRD visual criteria and rejection rules at required viewport/theme states. Fonts include local binaries and licenses; no remote dependency exists.

**Verification:** Run `node design-artifacts/trilium-redesign/check.mjs`, save stdout in `design-artifacts/trilium-redesign/evidence/check.txt`, validate keyboard controls in the local prototype, then run `git diff --check`. Task 2 cannot start until the check exits 0.

## Task 2: Build Authenticated Foundation And Shell

**Objective:** Consume Knowledge Studio tokens and recompose New Layout desktop shell without changing commands or state behavior.

**Context:** Existing shell composition lives in `desktop_layout.tsx`, launcher/tree/tab/note-header owners, right-panel components, and Next theme CSS. Classic must remain structurally unchanged.

**Inputs / dependencies:** Task 1 visual contract and font assets.

**Parallelizable:** Yes, after Task 1.

**Isolation boundary:** `apps/client/src/layouts/desktop_layout.tsx`, `widgets/containers/{root_container,left_pane_container,right_pane_container,split_note_container}.ts`, `widgets/{tab_row,note_tree,note_title}.ts*`, `widgets/launch_bar/**`, `widgets/layout/{InlineTitle,NoteBadges,NoteTitleActions,StatusBar}.*`, `widgets/sidebar/**`, matching component CSS/specs. Excludes shared Next-theme token/base files, mobile layout, entry screens, public share files, `widgets/note_types.tsx`, `widgets/NoteDetail.tsx`, and `widgets/type_widgets/**`.

**Steps:**
1. Consume Task 1 semantic tokens without editing their files or names.
2. Recompose workspace bar, navigation studio, tab/content frame, note header, status area, and contextual inspector using existing widgets and commands.
3. Preserve Electron drag regions, horizontal/full-width tab placement, split behavior, launcher configuration, right-panel states, background effects, RTL, and Classic compatibility.
4. Scope visual rules to New Layout where structure differs; retain common control tokens for Classic.
5. Add/update focused shell anatomy and behavior tests.

**Acceptance criteria:** New Layout no longer reads as recolored old three-column shell. Shell behavior matrix passes. Classic actions remain present and usable. Custom main/detail fonts and note colors remain authoritative.

**Verification:** Focused client tests for root/launcher/tabs/title/note detail/right panel/card/modal; client stylelint on touched CSS; `pnpm typecheck`; `pnpm client:build`.

## Task 3: Recompose Authenticated Mobile And Entry Screens

**Objective:** Apply same system to mobile shell and setup/login while preserving mobile and authentication behavior.

**Context:** Mobile has separate composition in `mobile_layout.tsx`; setup/login use independent entry roots and CSS.

**Inputs / dependencies:** Tasks 1 and 2 complete; Task 2 shell class/DOM contract is stable.

**Parallelizable:** No with Task 2; yes with Task 4 after Task 2 completes.

**Isolation boundary:** `apps/client/src/layouts/mobile_layout.tsx`, `layouts/mobile_layout.css`, `widgets/mobile_widgets/**`, `widgets/type_widgets/text/mobile_editor_toolbar.*`, `setup.tsx`, `setup.css`, `setup*.spec.tsx`, `login.tsx`, `login.css`, `login.spec.tsx`. Excludes desktop files, shared Next-theme token/base files, remaining note-type owners, and public share package.

**Steps:**
1. Recompose app bar, drawer, note header, context actions, editor toolbar, and bottom launcher with existing components.
2. Redesign all setup and login states from PRD matrix.
3. Preserve safe areas, virtual keyboard, splits, tab switching, TOTP/OIDC/password flows, focus order, sticky actions, and reduced motion.
4. Add/update focused DOM/behavior tests for changed anatomy.

**Acceptance criteria:** Required mobile/short-window fixtures have no clipping or unreachable controls. Entry and mobile behavior matrices pass. Touch targets are at least 44px.

**Verification:** Focused mobile, setup and login tests; client stylelint on touched CSS; `pnpm typecheck`; `pnpm client:build`.

## Task 4: Build Publication-First Shared Notes

**Objective:** Recompose default public shared notes into a modern publication while retaining every public contract and static-export parity.

**Context:** Public UI is independent EJS, vanilla TypeScript, and CSS under `packages/share-theme`; server renderer and ZIP exporter consume it.

**Inputs / dependencies:** Task 1 visual contract. No dependency on authenticated runtime code.

**Parallelizable:** Yes, after Task 1.

**Isolation boundary:** `packages/share-theme/**`; directly related server share renderer/template/static-export specs only. Excludes authenticated client files and backend authorization logic.

**Steps:**
1. Add share-side semantic tokens/font faces matching role contract.
2. Recompose EJS shell into publication masthead, collection navigation, article canvas, ToC rail, reading paths, metadata and footer.
3. Redesign search, child cards, note-type wrappers, theme control and mobile drawers.
4. Preserve required IDs/classes or update vanilla modules and assertions atomically.
5. Preserve all extension, branding, credentials, alias, external-link and live/static contracts from PRD matrix.
6. Update focused renderer/routes/ZIP tests.

**Acceptance criteria:** Public root and article read as publication, not read-only app. Every public page/renderer/extension matrix row remains functional. Custom template and omitted-default-CSS behavior remain unchanged.

**Verification:** `pnpm --filter @triliumnext/share-theme test`; `pnpm --filter @triliumnext/share-theme build`; focused server tests for `share/content_renderer`, `share/routes`, and `export/zip/share_theme`; server build.

## Task 5: Integrate Note-Type And Accessibility Matrix

**Objective:** Close cross-surface gaps after parallel implementation and prove exhaustive type/accessibility behavior.

**Context:** Shell changes can expose clipping or cascade failures in lazy note types and third-party canvases. Public and private implementations must preserve semantic roles without sharing runtime CSS.

**Inputs / dependencies:** Tasks 2, 3, and 4 complete.

**Parallelizable:** No.

**Isolation boundary:** `apps/client/src/widgets/note_types.tsx`, `apps/client/src/widgets/NoteDetail.tsx`, `apps/client/src/widgets/type_widgets/**`, their matching CSS/specs, and integration fixes in files owned by Tasks 2-4 after those tasks finish. This task alone owns note-type implementation changes. No feature additions.

**Steps:**
1. Walk authenticated and public note matrices, fixing only integration defects.
2. Check focus order, accessible names/states/live regions, contrast, target sizes, RTL and reduced motion.
3. Verify token-role parity and no selectors leak into third-party editors/canvases.
4. Verify font override precedence and no remote font URLs or requests.

**Acceptance criteria:** Every matrix row has test or documented fixture evidence. WCAG criteria in PRD pass. No layered editorial motif remains.

**Verification:** Focused regression tests; deterministic contrast/font URL checks; client/share builds; `pnpm typecheck`.

## Task 6: Documentation And Final Proof

**Objective:** Update user-facing documentation and run complete proving commands before review.

**Context:** Shell, entry and public-share visuals invalidate screenshots and possibly affordance descriptions. User Guide edits must use edit-docs workflow.

**Inputs / dependencies:** Task 5 complete and stable UI.

**Parallelizable:** No.

**Isolation boundary:** Relevant User Guide pages/screenshots plus verification-only fixes in prior task files.

**Steps:**
1. Audit and update New Layout, launcher, tabs, right sidebar, mobile, sharing, synchronization setup, and authentication documentation.
2. Replace stale screenshots through supported documentation workflow.
3. Run final builds/tests and Appendix E visual fixture matrix, recording pass/fail and screenshot paths in `design-artifacts/trilium-redesign/evidence.md`.
4. Request architecture and code review gates; resolve validated findings.

**Acceptance criteria:** Documentation matches shipped controls and composition. User accepts required visual fixtures. No unrelated files enter diff.

**Verification:** Execute every command and manual procedure in Appendices F and G, plus `git diff --check`. Record command, exit code, and date in `design-artifacts/trilium-redesign/evidence.md`.

## Execution Contract

**Task graph:** Task 1 -> Tasks 2 and 4 in parallel -> Task 3 -> Task 5 -> Task 6. Task 4 can continue in parallel through Task 3 but must finish before Task 5.

**Ownership boundaries:** Task 1 owns shared authenticated tokens, font assets, and removal/replacement of `editorial.css`. Tasks 2-4 own disjoint component/runtime roots. Task 5 alone owns note-type implementations and performs cross-boundary integration edits after parallel work ends.

**Chosen execution pattern:** Parallel waves. Wave 1: design and shared foundation. Wave 2: desktop and public publication. Wave 3: mobile/entry while public work finishes. Wave 4: note-type integration/accessibility. Wave 5: docs and final proof.

**Global acceptance:** Appendices A-G are authoritative, version `KS-1`. Every row requires recorded evidence. No backend/data/auth/search semantics change. No commit or push.

## Appendix A: Shell And Entry Matrix (KS-1)

| ID | Surface/state | Expected result | Owner | Evidence |
|---|---|---|---|---|
| SH-01 | Desktop workspace/global bar | Global menu, quick search, sync, theme, protected-session and custom launchers retain labels, commands and state; Electron drag/no-drag remains correct | Task 2 | Focused DOM/command tests + EL-01 |
| SH-02 | Tree navigation | Expand, collapse, select, context menu, keyboard navigation, drag/drop, scrolling and hoist/breadcrumb flows remain usable | Task 2 | Existing/new tree tests + VF-01/VF-02 |
| SH-03 | Left pane | Toggle, peek, focus restoration and user-resized width persist | Task 2 | Focused container test + VF-01 |
| SH-04 | Tabs | Open, activate, close, pin, reorder, new tab, history buttons and overflow preserve commands and state | Task 2 | Focused tab tests + VF-01/VF-03 |
| SH-05 | Tab orientations | Vertical launcher, horizontal launcher, regular tabs and full-width Electron tabs preserve placement | Task 2 | DOM tests + EL-01/VF-03 |
| SH-06 | Split notes | Create, close, move, resize and focus splits without state loss | Task 2 | Split-container tests + VF-03 |
| SH-07 | Note frame | Icon, editable title, badges, actions, inline title, formatting toolbar, read-only/shared status and status bar remain available in relevant state | Tasks 2/5 | Focused component tests + note rows |
| SH-08 | Inspector | Open, dismiss, dock/peek, resize, section collapse and focus work for Outline, Attributes, Connections, Chat and Widgets | Task 2 | Right-panel tests + VF-01 |
| SH-09 | Overlays | Dialog, dropdown, tooltip, toast and portal stacking retain summon, submit, dismiss and focus restoration | Task 2 | Existing/new overlay tests + VF-05 |
| SH-10 | Classic Layout | No structural markup change; launcher, tree, tabs, ribbon, pane actions and right pane remain functional under common tokens | Tasks 1/2 | Classic fixture + smoke assertions |
| MB-01 | Mobile navigation | Tree drawer opens/closes, quick search and navigator work, selected note returns focus to detail | Task 3 | Mobile DOM tests + VF-06 |
| MB-02 | Mobile note frame | Sidebar action, icon/title/badges/menu, content actions and tab switching remain reachable | Task 3 | Mobile component tests + VF-06/VF-07 |
| MB-03 | Mobile editing | Keyboard does not hide content/actions; editor toolbar follows keyboard gap; bottom launcher respects safe area | Task 3 | Responsive CSS assertions + MO-02/MO-03 |
| MB-04 | Mobile overlays | Dialogs and dropdowns use usable sheet/popover placement, dismiss correctly and restore focus | Task 3 | Focus tests + VF-07 |
| EN-01 | Setup language/welcome | Language selection and forward navigation remain keyboard/touch usable | Task 3 | `setup_language.spec.tsx` + VF-08 |
| EN-02 | Setup new document | Password, confirmation, validation, sync choice and submit states remain functional | Task 3 | `setup.spec.tsx`/service specs + VF-08 |
| EN-03 | Setup existing/restore | Existing server, backup upload, progress, error and unlock states retain transitions | Task 3 | `setup_existing`, `setup_restore`, `setup_backup`, `setup_unlock` specs |
| EN-04 | Login password/TOTP | Password, remember-me, TOTP, errors, recovery and submit/loading states retain behavior | Task 3 | `login.spec.tsx` + VF-09 |
| EN-05 | Login OIDC | Provider actions and return/error states remain present and usable | Task 3 | `login.spec.tsx` + VF-09 |

## Appendix B: Authenticated Note-Type Matrix (KS-1)

Every row runs in New Layout desktop and mobile, light and dark. Expected baseline for all rows: title/actions remain reachable; content is not clipped; scrolling/full-height behavior is correct; custom note color and `detailFontFamily` remain authoritative where supported; read-only/edit state is unchanged.

| ID | `ExtendedNoteType` / state | Additional expected result | Owner | Evidence |
|---|---|---|---|---|
| NT-01 | `editableText`, `readOnlyText` | CKEditor/read-only typography, links, tables, callouts, code and toolbar remain usable | Task 5 | Existing text specs + fixtures |
| NT-02 | `editableCode`, `readOnlyCode`, `markdown`, `sqlConsole` | Editor/output splits, syntax UI and full-height sizing remain usable | Task 5 | Focused type specs + fixtures |
| NT-03 | `book` list/grid/table/calendar/board/geomap/dashboard | Collection controls, cards/rows, empty states and overlays remain usable | Task 5 | Existing collection specs + fixtures |
| NT-04 | `webView`, `file`, PDF | Webview/file preview/full-height sizing and actions remain usable | Task 5 | Existing file spec + fixtures |
| NT-05 | `image` | Image viewer, sizing, zoom, fullscreen, action overlays and metadata remain usable | Task 5 | New focused Image spec + fixtures |
| NT-06 | `mermaid`, `mindMap`, `canvas` | OverlayControlGroup controls, canvas interaction and fullscreen remain usable without CSS leakage | Task 5 | Focused component specs + fixtures |
| NT-07 | `relationMap`, `noteMap` | Graph controls, labels and full-height canvas remain usable | Task 5 | Focused component specs + fixtures |
| NT-08 | `spreadsheet` | Univer toolbar, sheet canvas and popovers remain usable without CSS leakage | Task 5 | Existing/new focused spec + fixtures |
| NT-09 | `iconPack` | Search/list/actions and full-height behavior remain usable | Task 5 | Focused spec + fixtures |
| NT-10 | `llmChat` | Messages, tool cards, input, attachments, streaming/error/read-only states remain usable | Task 5 | Existing llm-chat specs + fixtures |
| NT-11 | `attachmentList`, `attachmentDetail`, `blobStub` | Metadata, download/open actions and empty/error states remain usable | Task 5 | Existing/new focused specs + fixtures |
| NT-12 | `protectedSession` | Unlock form, errors and full-height placement remain usable | Task 5 | Focused spec + fixtures |
| NT-13 | `render`, `contentWidget` | Embedded custom content retains isolation, sizing and scripting contract | Task 5 | Focused smoke spec + fixtures |
| NT-14 | `empty`, `doc`, `search` | Empty/document/search-result states retain layout and actions | Task 5 | Existing/new focused specs + fixtures |

## Appendix C: Public Share Contract Matrix (KS-1)

| ID | Contract/state | Expected result | Source/assertion | Owner |
|---|---|---|---|---|
| PB-01 | Root/collection page | Publication masthead, child cards/tree and footer render | `page.ejs`, renderer test | Task 4 |
| PB-02 | Article page | Article canvas, metadata, ToC, previous/next and child links render | templates + renderer test | Task 4 |
| PB-03 | Search | Open/type/results/empty/error/keyboard/dismiss behavior survives DOM changes | `scripts/modules/search.ts`, share-theme test | Task 4 |
| PB-04 | Navigation drawers | Desktop sidebar, mobile nav and ToC open/dismiss/focus behavior survives | `sidebar.ts`, `mobile.ts`, `toc.ts` tests | Task 4 |
| PB-05 | Theme | Light/dark/system switch and persisted preference work | `theme.ts` test | Task 4 |
| PB-06 | Credentials | Protected-share login, invalid credential and successful return path remain unchanged | `apps/server/src/share/routes.spec.ts` | Task 4 |
| PB-07 | Alias | `#shareAlias` routes and escaped relative links remain correct | routes/content-renderer specs | Task 4 |
| PB-08 | External links | External tree/subpage links retain `_blank` and `noopener noreferrer`; internal links do not gain them | `content_renderer.spec.ts` | Task 4 |
| PB-09 | Branding | Logo/favicon/title metadata and favicon contrast behavior remain supported | `page.ejs`, `favicon_contrast.ts`, renderer assertions | Task 4 |
| PB-10 | `~shareCss` | Ordered custom CSS remains included after default styles | `content_renderer.ts` focused test | Task 4 |
| PB-11 | `#shareOmitDefaultCss` | Default theme is omitted while custom content remains valid | `content_renderer.ts` focused test | Task 4 |
| PB-12 | `~shareJs` | Ordered custom scripts remain included under existing security contract | `content_renderer.ts` focused test | Task 4 |
| PB-13 | `~shareHtml` | `head/body/content` start/end locations remain injected and escaped as currently specified | `page.ejs` + renderer focused tests | Task 4 |
| PB-14 | Custom EJS template | Custom template selection still bypasses/defaults exactly as before | `routes.spec.ts` custom-template test | Task 4 |
| PB-15 | Note renderers | Text/code/image/file/PDF/mermaid/math/video/embed/task-state/link-embed outputs retain behavior | renderer fixtures + share-theme test | Task 4 |
| PB-16 | Live/static parity | Same templates, styles, scripts, fonts and custom extensions appear in live route and exported ZIP | renderer + ZIP focused tests and asset manifest diff | Task 4 |
| PB-17 | 404/error | Missing alias/note and rendering errors preserve status and usable error presentation | `404.ejs`, routes specs | Task 4 |

## Appendix D: Visual And Accessibility Rules (KS-1)

| ID | Rule | Pass condition | Owner/evidence |
|---|---|---|---|
| VA-01 | Useful asymmetry | At 1440x900 with inspector open, left navigation and right inspector visibly differ in width/weight and canvas axis is deliberately offset; reject equal mirrored rails | Tasks 2/6, VF-01 screenshot |
| VA-02 | Canvas dominance | At 1280x720 with inspector closed, compact navigation leaves content dominant | Tasks 2/6, VF-02 screenshot |
| VA-03 | Visual language | Graphite chrome, luminous neutral canvas, sans typography, cobalt primary and coral attention roles appear consistently; no serif/ruled-paper motif | Tasks 1-6, screenshots + static CSS check |
| VA-04 | Contrast | Normal text >= 4.5:1; large text >= 3:1; UI/focus indicators >= 3:1 against adjacent colors | Tasks 1/4/5, automated token contrast report + spot checks |
| VA-05 | Keyboard/focus | All interactive controls reachable; visible focus; logical order; dialogs/drawers trap then restore focus; no keyboard trap | Tasks 2-6, focused tests + manual paths |
| VA-06 | Semantics | Accessible names, roles, expanded/selected/pressed states and live errors/status remain exposed | Tasks 2-5, DOM accessibility assertions |
| VA-07 | Touch | Mobile targets are at least 44x44 CSS px unless inline text action | Task 3, computed-size evidence |
| VA-08 | Motion | `prefers-reduced-motion: reduce` removes nonessential transitions/animation without hiding state | Tasks 1/4/5, CSS assertion + VF-13 |
| VA-09 | RTL | Navigation, actions, drawers and reading direction mirror without clipping | Tasks 2-6, VF-12 |
| VA-10 | Font contracts | Local OFL files/licenses ship; no remote font URL/request; `mainFontFamily` and `detailFontFamily` override defaults | Tasks 1/5/6, build asset scan + DOM style tests |

## Appendix E: Visual Fixture Matrix (KS-1)

Screenshots and checklist results go under `design-artifacts/trilium-redesign/evidence/`; `evidence.md` links every ID. User performs final aesthetic acceptance; automated checks prove behavior, not taste.

Reproducible procedure:

1. Start static reference with `pnpm exec http-server design-artifacts/trilium-redesign -a 127.0.0.1 -p 37998 -c-1` and open `http://127.0.0.1:37998/`. Use prototype page navigation, Desktop/Mobile controls, Light/Dark control, and each named state tab. Task 1 must add Public root/article/search/drawer states to this registry.
2. Start authenticated fixture from `apps/server` with `NODE_ENV=development TRILIUM_ENV=dev TRILIUM_PORT=37999 TRILIUM_DATA_DIR=spec/db TRILIUM_DOCUMENT_PATH=../../packages/trilium-core/src/test/fixtures/document.db TRILIUM_INTEGRATION_TEST=memory TRILIUM_RESOURCE_DIR=src npx tsx ./src/main.ts`. Open `http://127.0.0.1:37999/`; append `?mobile` for mobile layout. Writes remain in RAM.
3. Use fixture tree to leave initial protected note. Use existing UI controls to set inspector open/closed, launcher orientation, tabs/splits, theme and each note type. Use `window.glob.appContext.triggerCommand(...)` only to summon an otherwise deep dialog; do not mutate implementation state directly.
4. Exercise setup/login through their production entry URLs on disposable data only. If fixture cannot expose one state naturally, its component spec and static reference state provide behavioral and visual evidence separately; do not modify personal data.
5. Exercise public routes from shared notes in the in-memory fixture. For contracts needing generated data (`~shareCss`, `~shareJs`, `~shareHtml`, alias, custom EJS, credentials), use renderer/route test fixtures for behavior and matching static reference states for appearance.
6. User captures browser screenshots using Capture Manifest paths below and records accepted/rejected plus observed state in `evidence.md`. Each path contains a unique state slug. Agent does not automate visual walkthrough; this preserves repository UI-test policy.
7. Task 1 adds `design-artifacts/trilium-redesign/check.mjs`. Run `node design-artifacts/trilium-redesign/check.mjs`; it loads static reference DOM at Appendix E sizes and fails on missing state IDs, remote font URLs, token contrast below VA-04, non-inline interactive boxes below 44x44 in mobile reference, old editorial selectors, or ruled-paper declarations. Production DOM behavior remains covered by focused tests.
8. Stop fixtures with `kill $(lsof -tiTCP:37998 -sTCP:LISTEN)` and `kill $(lsof -tiTCP:37999 -sTCP:LISTEN)`.

| ID | Surface | Viewport/state | Theme/direction | Expected focus |
|---|---|---|---|---|
| VF-01 | New Layout desktop | 1440x900, inspector open | light/LTR | VA-01, shell, text note |
| VF-02 | New Layout desktop | 1280x720, inspector closed | light/LTR | VA-02, tree/canvas |
| VF-03 | New Layout desktop | 1024x768, full-width tabs + split notes | dark/LTR | tabs/splits/overflow |
| VF-04 | Classic desktop | 1280x720 | light and dark/LTR | SH-10 compatibility |
| VF-05 | Desktop overlays | 1280x720, dialog + dropdown/toast samples | dark/LTR | stacking/focus |
| VF-06 | Mobile workspace | 390x844, drawer closed/open | light/LTR | navigation/safe areas |
| VF-07 | Mobile editor | 375x667, keyboard simulated, overlay open | dark/LTR | toolbar/sheet/no clipping |
| VF-08 | Setup | 1280x720 and 375x667 short window | light/LTR | all EN-01..03 states |
| VF-09 | Login | 1280x720 and 375x667 short window | dark/LTR | EN-04..05 states |
| VF-10 | Public root/article | 1440x900 | light and dark/LTR | PB-01/PB-02/VA-03 |
| VF-11 | Public mobile | 390x844, nav/ToC/search open | light/LTR | PB-03/PB-04 |
| VF-12 | Authenticated/public RTL | 1280x720 and 390x844 | light/RTL locale | VA-09 |
| VF-13 | Motion | 1280x720 and 390x844 | dark/reduced motion | VA-08 |
| VF-14 | Note types | 1280x720 and 390x844 | light and dark/LTR | NT-01..14 checklist |

### Capture Manifest

Use current stable Chromium at 100% zoom. Start each production capture from a fresh page load. Prototype captures use named page/state controls. Authenticated URLs use deterministic note IDs from `packages/trilium-core/src/test/fixtures/document.db`.

| Capture | Source and setup | Artifact path |
|---|---|---|
| VF-01-inspector | `http://127.0.0.1:37999/#root/00x8w05mCA3i`; light; open inspector/Attributes; 1440x900 | `evidence/VF-01-inspector-light-1440x900.png` |
| VF-02-canvas | Same URL; light; dismiss inspector; 1280x720 | `evidence/VF-02-canvas-light-1280x720.png` |
| VF-03-splits | Same URL; dark; create second split; open `#root/1PCrFIFxF4is` in it; full-width tabs; 1024x768 | `evidence/VF-03-splits-dark-1024x768.png` |
| VF-04-classic-light | Same URL; disable New Layout; light; 1280x720 | `evidence/VF-04-classic-light-1280x720.png` |
| VF-04-classic-dark | Same URL; disable New Layout; dark; 1280x720 | `evidence/VF-04-classic-dark-1280x720.png` |
| VF-05-dialog | Same URL; New Layout; dark; Options dialog plus open dropdown and visible focus; 1280x720 | `evidence/VF-05-dialog-dark-1280x720.png` |
| VF-06-mobile-closed | `http://127.0.0.1:37999/?mobile#root/00x8w05mCA3i`; light; drawer closed; 390x844 | `evidence/VF-06-mobile-closed-light-390x844.png` |
| VF-06-mobile-open | Same URL/state; open tree drawer; 390x844 | `evidence/VF-06-mobile-open-light-390x844.png` |
| VF-07-mobile-editor | Same URL; dark; focus editor; open detail menu; device/simulator keyboard visible; 375x667 | `evidence/VF-07-editor-dark-375x667.png` |
| VF-08-setup-language | Prototype `http://127.0.0.1:37998/`; Setup/Language; mobile/light; 375x667 | `evidence/VF-08-setup-language-light-375x667.png` |
| VF-08-setup-error | Prototype; Setup/Sync failure; desktop/light; 1280x720 | `evidence/VF-08-setup-error-light-1280x720.png` |
| VF-08-setup-restore | Prototype; Setup/Restore passphrase; mobile/light; 375x667 | `evidence/VF-08-setup-restore-light-375x667.png` |
| VF-09-login-password | Prototype; Entry/Login password + TOTP; desktop/dark; 1280x720 | `evidence/VF-09-login-password-dark-1280x720.png` |
| VF-09-login-oidc | Prototype; Entry/OIDC login; mobile/dark; 375x667 | `evidence/VF-09-login-oidc-dark-375x667.png` |
| VF-09-login-error | Prototype; Entry/OIDC error; mobile/dark; 375x667 | `evidence/VF-09-login-error-dark-375x667.png` |
| VF-10-public-root | Prototype; Public/Root; desktop/light; 1440x900 | `evidence/VF-10-public-root-light-1440x900.png` |
| VF-10-public-article | Prototype; Public/Article; desktop/dark; 1440x900 | `evidence/VF-10-public-article-dark-1440x900.png` |
| VF-11-public-nav | Prototype; Public/Article; mobile/light; navigation open; 390x844 | `evidence/VF-11-public-nav-light-390x844.png` |
| VF-11-public-toc | Prototype; Public/Article; mobile/light; ToC open; 390x844 | `evidence/VF-11-public-toc-light-390x844.png` |
| VF-11-public-search | Prototype; Public/Search; mobile/light; query `Penang`; 390x844 | `evidence/VF-11-public-search-light-390x844.png` |
| VF-12-auth-rtl | Authenticated fixture; `#root/00x8w05mCA3i`; RTL content language; light; 1280x720 | `evidence/VF-12-auth-rtl-light-1280x720.png` |
| VF-12-public-rtl | Prototype; Public/Article/RTL; mobile/light; 390x844 | `evidence/VF-12-public-rtl-light-390x844.png` |
| VF-13-auth-motion | Authenticated fixture; reduced motion; dark; inspector open; 1280x720 | `evidence/VF-13-auth-motion-dark-1280x720.png` |
| VF-13-public-motion | Prototype; reduced motion; Public/Article; mobile/dark; 390x844 | `evidence/VF-13-public-motion-dark-390x844.png` |
| VF-14-types-desktop | Prototype Notes/Collections; each NT-01..14 slug; light and dark; 1280x720 | `evidence/VF-14-<NT-ID>-<slug>-<theme>-1280x720.png` |
| VF-14-types-mobile | Prototype Notes/Collections; each NT-01..14 slug; light and dark; 390x844 | `evidence/VF-14-<NT-ID>-<slug>-<theme>-390x844.png` |

## Appendix F: Platform Matrix (KS-1)

| ID | Runtime | Procedure | Pass condition | Owner |
|---|---|---|---|---|
| EL-01 | Electron | `pnpm --filter desktop build`, then production launch for user fixture | App loads over `trilium-app://`; frameless drag/no-drag, native controls, full-width tabs, theme/background and window resizing work | Task 6 |
| EL-02 | Electron tests | `pnpm --filter desktop test` with narrow window/layout-related pattern when one exists | No renderer/main integration regression | Task 6 |
| ST-01 | Standalone build | `pnpm --filter standalone build` | Bundle completes with fonts/client assets and no Node-only import | Task 6 |
| ST-02 | Standalone behavior | `TRILIUM_INTEGRATION_TEST=memory pnpm --filter standalone build`, production preview/user fixture | New Layout, setup and public theme assets load through service worker paths | Task 6 |
| MO-01 | Capacitor sync | `pnpm --filter @triliumnext/mobile sync` | Standalone dist copies into Android/iOS projects without missing assets | Task 6 |
| MO-02 | Android | `pnpm --filter @triliumnext/mobile run:android` when SDK/device available; otherwise CI workflow evidence is explicitly recorded as unavailable locally | Safe areas, drawer, keyboard, bottom toolbar and local API routing work at `https://localhost` | Task 6 |
| MO-03 | iOS | `pnpm --filter @triliumnext/mobile run:ios` when simulator available | Safe areas, interactive keyboard dismissal, `--tn-keyboard-gap`, fonts/images/styles and local API interception work at `capacitor://localhost` | Task 6 |
| MO-04 | Mobile JS routes | `pnpm --filter standalone test ios-interceptors`; `pnpm --filter standalone test capacitor_http_handler`; `pnpm --filter standalone test sw`; `pnpm --filter standalone test main` | Platform request-routing contracts remain green | Task 6 |

## Appendix G: Build, Test And Documentation Matrix (KS-1)

| ID | Area | Required evidence | Owner |
|---|---|---|---|
| BV-01 | Client behavior | Narrowest client Vitest patterns covering every changed owner; each new bug spec demonstrated red without fix then green with fix | Tasks 2/3/5 |
| BV-02 | Client styles | `pnpm --filter @triliumnext/client stylelint` on supported touched CSS scope; ignored CSS is reported, not claimed checked | Tasks 1-5 |
| BV-03 | Share behavior | `pnpm --filter @triliumnext/share-theme test` plus focused `apps/server/src/share/content_renderer.spec.ts` and `routes.spec.ts` runs | Task 4 |
| BV-04 | Share assets | `pnpm --filter @triliumnext/share-theme build`; inspect built asset manifest for local fonts and no remote URLs | Tasks 4/6 |
| BV-05 | Type/build | `pnpm typecheck`; `pnpm client:build`; `pnpm server:build`; `pnpm --filter standalone build`; `pnpm --filter desktop build` | Task 6 |
| BV-06 | Repository hygiene | `git diff --check`; inspect `git status --short` and scoped diff; no unrelated change altered | Task 6 |
| DC-01 | New Layout docs | Audit User Guide for New Layout, tree, launcher, tabs, splits, title/actions, right sidebar and mobile controls; update text/screenshots via `pnpm edit-docs:edit-docs` | Task 6 |
| DC-02 | Entry docs | Replace stale `Installation & Setup/Synchronization_sync-init.png`; audit setup/login instructions | Task 6 |
| DC-03 | Share docs | Audit public sharing, custom CSS/JS/HTML/templates, branding, aliases and search/navigation descriptions | Task 6 |
| DC-04 | Theme docs | Verify `Theme development/Customize the Next theme.md` still describes valid variables and font overrides | Task 6 |

### Exact Test Invocations

Task 2 runs each applicable command after adding a named spec where coverage is absent:

```bash
pnpm --filter client test root_container
pnpm --filter client test split_note_container
pnpm --filter client test note_tree
pnpm --filter client test RightPanelContainer
pnpm --filter client test RightPanelWidget
pnpm --filter client test desktop_layout
pnpm --filter client test tab_row
pnpm --filter client test note_title
```

Task 3:

```bash
pnpm --filter client test mobile_layout
pnpm --filter client test mobile_editor_toolbar
pnpm --filter client test login
pnpm --filter client test setup
pnpm --filter client test setup_language
pnpm --filter client test setup_existing
pnpm --filter client test setup_restore
pnpm --filter client test setup_backup
pnpm --filter client test setup_unlock
```

Task 4:

```bash
pnpm --filter share-theme test
pnpm --filter server test src/share/content_renderer.spec.ts
pnpm --filter server test src/share/routes.spec.ts
pnpm --filter server test src/services/export/zip/share_theme.spec.ts
pnpm --filter server test src/routes/assets.spec.ts
```

Task 5 adds `apps/client/src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx` with one test named for each NT row. Exact invocations:

```bash
pnpm --filter client test src/widgets/NoteDetail.spec.ts
pnpm --filter client test src/widgets/note_types.spec.ts
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-01
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-02
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-03
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-04
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-05
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-06
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-07
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-08
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-09
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-10
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-11
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-12
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-13
pnpm --filter client test src/widgets/type_widgets/knowledge_studio_matrix.spec.tsx -t NT-14
```

Task 6 runs platform commands from Appendix F and:

```bash
node design-artifacts/trilium-redesign/check.mjs
pnpm typecheck
pnpm client:build
pnpm server:build
pnpm --filter share-theme build
pnpm --filter standalone build
pnpm --filter desktop build
pnpm --filter mobile sync
git diff --check
git status --short
```
