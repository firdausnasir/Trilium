# Knowledge Studio Task 1 Evidence

## Automated

`check.mjs` verifies required private/public state IDs, local font assets and OFL files, theme import uniqueness, Knowledge Studio tokens, font-option variable usage, rejected source patterns, and core light/dark contrast pairs. Successful stdout is stored in `evidence/check.txt`.

## Verification

Last verified: 2026-09-04.

| Area                      | Command                                                                                 | Result                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Static reference          | `node design-artifacts/trilium-redesign/check.mjs`                                      | Passed; 102 registered states and 68 required states present                                                            |
| Types                     | `pnpm typecheck`                                                                        | Passed                                                                                                                  |
| Client contracts          | Focused client Vitest suites                                                            | Passed; 187 tests                                                                                                       |
| Public theme              | `pnpm --filter @triliumnext/share-theme test`                                           | Passed; 10 tests                                                                                                        |
| Public rendering/export   | `pnpm --filter server test share_theme.spec.ts content_renderer.spec.ts routes.spec.ts` | Passed; 74 tests                                                                                                        |
| Server contracts          | Focused server Vitest suites                                                            | Passed; 59 additional tests before final review fixes                                                                   |
| Builds                    | `pnpm client:build`, `pnpm server:build`, `pnpm standalone:build`, `pnpm desktop:build` | Passed                                                                                                                  |
| Mobile packaging          | `pnpm mobile:sync`                                                                      | Passed                                                                                                                  |
| Diff hygiene              | `git diff --check`                                                                      | Passed                                                                                                                  |
| Production artifact check | `TRILIUM_RESOURCE_DIR=src pnpm --filter server test-build`                              | Share-theme parity passed; command remains blocked by the pre-existing empty `node_modules/bindings` artifact assertion |

Targeted negative controls removed the web-view height rule, logical RTL spacing, RTL navigation arrows and tree expander, public document direction, static-export 404 locale inputs, 404 border-box sizing, live alias URL encoding, mobile safe-area row sizing, and valid non-Electron centering selector. Their focused tests failed before each fix was restored.

## Manual acceptance pending

Browser-computed target sizes, Electron drag regions, keyboard paths, responsive clipping, mobile safe-area and keyboard behavior, dropdown/modal stacking, custom-font rendering, RTL composition, note-type canvas clipping, and aesthetic screenshot acceptance remain manual. Repository policy leaves running-app and physical-device validation to the user. User acceptance remains final visual gate.
