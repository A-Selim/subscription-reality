# 51: Brand favicon and a bigger brand name in the top bar

Status: resolved
Lane: small
Blocked by: none
Test seam: Manual browser check (icon and sizes); existing page tests must still pass
Spec: Owner request (2026-10-14), after the first deploy to https://subscription-reality.pages.dev/.

## Why

1. The browser tab still shows the default Angular favicon (`public/favicon.ico` from the CLI scaffold). It should show the app's own brand mark: the white "S" on the dark rounded square from the top bar.
2. The brand name "Subscription Reality" at the left of the top bar uses the body font size, so it looks small next to the hero. The owner wants it bigger.

## What to build

1. **Favicon.**
   - Add `public/favicon.svg`: a `viewBox="0 0 64 64"` square, `rect` filling it with `rx="22"` and `fill="#171717"` (the `--ink` token), and a white bold "S" centred in it (`text-anchor="middle"`, `dominant-baseline="central"`, `font-weight="800"`, about `font-size="38"`, font stack `Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`). Keep it a few lines, no scripts, no external references.
   - Delete `public/favicon.ico` (the Angular logo).
   - In `src/index.html`, replace the `favicon.ico` link with `<link rel="icon" type="image/svg+xml" href="favicon.svg">` and add `<link rel="apple-touch-icon" href="apple-touch-icon.png">`. The orchestrator adds `public/apple-touch-icon.png` (rendered from the SVG) after your change, so don't create it.
   - Change nothing else in `src/index.html`: no CSP meta tag, no other tags.
2. **Bigger brand name** in `src/app/top-bar/top-bar.scss`:
   - `.brand`: `font-size: 20px`.
   - `.brandmark`: `width` and `height` 38px, `border-radius: 13px`, so the mark grows with the text.
   - Inside the existing `@media (max-width: 560px)` block: `.brand` `font-size: 18px`, `.brandmark` 34px wide and high with `border-radius: 12px`.
   - The top bar must still wrap without horizontal scroll at 320px wide.

## Do not

- Do not change `src/styles.scss`, the top-bar markup or its text (tests find it).
- Do not touch `docs/` or the prototype.
- Do not add dependencies. Do not commit.

## Acceptance criteria

- [x] `public/favicon.svg` exists and draws a white "S" on a `#171717` rounded square; `public/favicon.ico` is gone.
- [x] `src/index.html` links `favicon.svg` (type `image/svg+xml`) and `apple-touch-icon.png`, and has no other changes.
- [x] The brand name is 20px with a 38px mark on desktop, and 18px with a 34px mark at 560px wide and below.
- [x] The top bar has no horizontal scroll at 320px wide. (Manual browser check.)
- [x] `npm test -- --watch=false` and `npm run build` pass.

## Comments

Added the brand SVG favicon, deleted the Angular favicon, added both icon links, and applied the requested desktop and mobile brand sizes in SCSS. The SVG attributes and the index-only link changes were verified from source. The Apple touch icon PNG remains for the orchestrator to supply.

Both TypeScript checks pass; the page suite passes (134 tests), and the full suite passes (248 tests across 3 files). Production build verification is blocked: `npm run build` aborts with a native Node malloc error ("pointer being freed was not allocated") under Node 24.21.0; retrying with one build worker, snapshots disabled, and the installed Node 26 runtime also aborted. No dependency or build configuration changes were made.

No browser is available in this session. Leave the rendered desktop/mobile size and 320px horizontal-scroll checks for a manual browser check, including the tab icon's appearance. The ticket remains unresolved until the build and manual checks pass.

Orchestrator (2026-10-14): build passes outside the sandbox; 248 tests pass. Checked in Chromium on the production build: brand 20px with a 38px mark at 1280px, 18px with a 34px mark at 560px and 320px, no horizontal scroll at 320px (the Start adding button wraps under the brand there, as before). Added `public/apple-touch-icon.png`, rendered from the SVG with square corners because iOS masks the corners itself. Review: no standard or spec violations; the size change is recorded in `docs/agreed-changes.md` › Page structure, since it departs from the prototype.
