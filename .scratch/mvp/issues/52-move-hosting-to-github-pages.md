# 52: Move hosting from Cloudflare Pages to GitHub Pages

Status: resolved
Lane: small
Blocked by: none
Test seam: Local production build with the Pages base href, served under `/subscription-reality/` (manual check by the orchestrator); existing tests must still pass
Spec: Owner request (2026-10-23). LinkedIn marks `*.pages.dev` links as suspicious, so the owner is moving the live demo to `https://a-selim.github.io/subscription-reality/` and deleting the Cloudflare account.

## Why

LinkedIn flags the shared `pages.dev` domain, so the live demo link can't be shared there. GitHub Pages (`github.io`) is free, trusted, and sits next to the repo. GitHub Pages cannot send custom response headers, so `public/_headers` stops doing anything and the docs must say what protection is left.

## What to build

1. **Deploy workflow:** add `.github/workflows/deploy-pages.yml`. Match the style of `.github/workflows/ci.yml` (same action versions for checkout and setup-node, Node `24.21.0`, npm cache, `npm ci`).
   - Name `Deploy to GitHub Pages`. Triggers: `push` to `main` and `workflow_dispatch`.
   - Top-level `permissions`: `contents: read`, `pages: write`, `id-token: write`.
   - `concurrency`: group `pages`, `cancel-in-progress: false`.
   - Job `build` (ubuntu-latest, `timeout-minutes: 15`): checkout, setup-node, `npm ci`, `npm test -- --watch=false`, then `npm run build -- --base-href /subscription-reality/`, then `actions/configure-pages@v6` and `actions/upload-pages-artifact@v5` with `path: dist/subscription-reality/browser`.
   - Job `deploy`: `needs: build`, `environment` named `github-pages` with `url: ${{ steps.deployment.outputs.page_url }}`, one step `actions/deploy-pages@v5` with `id: deployment`.
   - Keep the base href in the workflow only. Do not change `angular.json` or `src/index.html`; local `npm run build` and `npm start` keep serving from `/`.
2. **Remove the dead headers file:** delete `public/_headers`. Nothing on GitHub Pages reads it.
3. **Docs:**
   - `docs/deployment.md`: rewrite the opening paragraph. Hosted on **GitHub Pages** at `https://a-selim.github.io/subscription-reality/`, deployed by `.github/workflows/deploy-pages.yml` on every push to `main` (and by hand from the Actions tab). Repo setting: Settings → Pages → Source = GitHub Actions. The build uses `--base-href /subscription-reality/` because the site lives under a sub-path. Remove every mention of Cloudflare and `public/_headers`.
   - Same file, "Content-Security-Policy" part 2, "Other headers" and "Caching": GitHub Pages cannot set response headers. Keep the header values as the reference for a future host that can, but say plainly that they are **not sent today**. State what is still enforced (the `autoCsp` meta tag for scripts, HTTPS) and what is lost (`frame-ancestors` so the page can be framed, `style-src`/`img-src`/`connect-src` and the other directives, `nosniff`, `Referrer-Policy`, `Permissions-Policy`). Caching: GitHub Pages sends `Cache-Control: max-age=600` for every file; there is no `immutable` caching of hashed files.
   - Same file, "Keep one origin": add that the move from `subscription-reality.pages.dev` to `a-selim.github.io` is such a move, so data saved at the old address does not carry over. Also note that every project on `a-selim.github.io` shares one origin, so any other GitHub Pages project under that account can read this app's IndexedDB.
   - Same file, "Check after each deploy" step 3: use `curl -I https://a-selim.github.io/subscription-reality/` and drop the header check (step 4 too), since no custom headers are sent.
   - `README.md` line 9: live demo link becomes `[a-selim.github.io/subscription-reality](https://a-selim.github.io/subscription-reality/)`.
   - `README.md` security bullet (line 39): drop the `public/_headers` sentence; say the static host sends no extra security headers, with a link to `docs/deployment.md`.
   - `AGENTS.md`, Security section, last bullet: change "Deploy headers live in `docs/deployment.md`." to "Hosting and headers are described in `docs/deployment.md`."
   - Add `docs/adr/0002-host-on-github-pages.md`, following the format of `docs/adr/0001-single-page-no-routing.md`: the decision (GitHub Pages, deployed by Actions), why (LinkedIn flags `pages.dev`; free; trusted domain), and the consequences (no custom headers, shared `a-selim.github.io` origin, base href sub-path, data at the old address left behind). A custom domain is the way back to custom headers if ever needed.

## Do not

- Do not change `ci.yml`, `angular.json`, `src/`, `docs/project-brief.md`, `docs/agreed-changes.md`, `CLAUDE.md`, or the prototype.
- Do not add a CSP `<meta>` tag or anything else to `src/index.html`.
- Do not add dependencies. Do not commit.

## Acceptance criteria

- [x] `.github/workflows/deploy-pages.yml` exists as described and is valid YAML.
- [x] `public/_headers` is gone and no file outside `.scratch/` mentions Cloudflare, `pages.dev` (except the "Keep one origin" note and the ADR) or `_headers`.
- [x] `npm run build -- --base-href /subscription-reality/` produces `index.html` with `<base href="/subscription-reality/">` and the `autoCsp` meta tag; served under `/subscription-reality/` the app loads with no CSP errors and a saved subscription survives a reload. (Orchestrator check.)
- [x] `docs/deployment.md`, `README.md`, `AGENTS.md` and the new ADR match the text above.
- [x] `npm test -- --watch=false` and `npm run build` pass.

## Comments

- 2026-10-23: Implemented by Codex, reviewed by Claude. Tests (248) and both builds pass. Build served locally under `/subscription-reality/`: no console or CSP errors, every asset loads from the sub-path, a saved subscription survives a reload. Review follow-up: Pages permissions moved to the deploy job, job names and timeout match `ci.yml`, deployment doc notes Enforce HTTPS and the 10-minute stale `index.html` window. Live check on github.io is pending the owner enabling Pages.
