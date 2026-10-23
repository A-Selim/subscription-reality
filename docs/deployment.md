# Deployment

Hosted on **GitHub Pages** at https://a-selim.github.io/subscription-reality/. [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) builds and deploys on every push to `main`, or by hand from the Actions tab. In the repo, set Settings → Pages → Source to **GitHub Actions**. The build uses `--base-href /subscription-reality/` because the site lives under a sub-path. Local builds and the dev server keep serving from `/`.

## What we deploy

- `npm run build` writes a static site to `dist/subscription-reality/browser/`. Upload that folder. There is no server code.
- The app is one page with no router ([ADR 0001](adr/0001-single-page-no-routing.md)), so the host needs no rewrite rule for deep links.
- Serve it over **HTTPS only**. In Settings → Pages, tick **Enforce HTTPS**. GitHub Pages has no HSTS setting.

## Keep one origin

Saved data lives in the browser's IndexedDB, which belongs to one origin (scheme + domain + port). If the app later moves to another domain or subdomain, users open an empty app and their data stays behind at the old address. Choose the final domain before people start using it.

The move from `subscription-reality.pages.dev` to `a-selim.github.io` is such a move. Data saved at the old address does not carry over. Every project on `a-selim.github.io` shares one origin, so any other GitHub Pages project under that account can read this app's IndexedDB.

## Content-Security-Policy

Only part 1 (scripts, through the build's meta tag) is enforced. Part 2 is not sent today because GitHub Pages cannot set custom response headers.

1. **Scripts: already in the build.** The production build sets `security.autoCsp` in `angular.json`. The CLI hashes every inline script and adds a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` (`script-src 'strict-dynamic' 'sha256-…' https: 'unsafe-inline'`, `object-src 'none'`, `base-uri 'self'`; browsers that support hashes ignore the `https:` and `'unsafe-inline'` fallbacks). It needs no nonce and works on any static host.
   - What it blocks: injected HTML with inline handlers (`<img onerror=…>`), `javascript:` URLs and inline scripts it didn't hash. What it allows: a script created by code that already runs (`'strict-dynamic'`). So the CSP is a second line of defence. The first is the AGENTS.md rule: never bind user text as HTML.
2. **Everything else: a reference for a future host.** This header is not sent today. Some directives (`frame-ancestors`) only work in a header, and Angular adds component styles as inline `<style>` elements, so styles need `'unsafe-inline'`:

```
Content-Security-Policy: style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; media-src 'none'; worker-src 'none'; form-action 'none'; frame-ancestors 'none'
```

Without this header, `frame-ancestors` does not protect the page, so it can be framed. The `style-src`, `img-src`, `connect-src` and other directives above are not enforced either.

- Do **not** put `default-src` or `script-src` in this header. A second policy with either one blocks the hashed loader script in the meta tag, and the page stays blank.
- `img-src data:` is needed for the select chevron (an inline SVG in `src/app/shared/_subscription-select.scss`).
- `connect-src 'self'`: the app makes no network calls. If one is ever added, its origin goes here.

## Other headers

These values are a reference for a future host that can set response headers. They are not sent today. The app has no `nosniff`, `Referrer-Policy` or `Permissions-Policy` protection from these headers.

```
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

## Caching

GitHub Pages sends `Cache-Control: max-age=600` for every file. It cannot set custom response headers. Hashed files do not get `immutable` caching.

A deploy replaces the whole site and `index.html` can stay cached for up to 10 minutes, so a visitor may briefly get an old page that asks for script files that no longer exist; a hard reload fixes it.

For a future host that can set headers, use these values. They are not sent today:

- `index.html`: `Cache-Control: no-cache`, so a new deploy is picked up on the next visit. The CSP hashes live in this file, so a stale copy can't load newer scripts.
- Hashed files (`main-*.js`, `styles-*.css`, `chunk-*.js`): `Cache-Control: public, max-age=31536000, immutable`.

## Check after each deploy

1. Open the site with the browser console open. There must be no CSP errors, and the app must load.
2. Add a subscription and reload. It must still be there.
3. Confirm the site responds over HTTPS with `curl -I https://a-selim.github.io/subscription-reality/`.
