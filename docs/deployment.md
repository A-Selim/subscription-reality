# Deployment

The host is not chosen yet (2026-10-09). This file lists what any host must do, so the choice only adds the host's own config syntax. When a host is picked, add its config file to the repo and record the choice here.

## What we deploy

- `npm run build` writes a static site to `dist/subscription-reality/browser/`. Upload that folder. There is no server code.
- The app is one page with no router ([ADR 0001](adr/0001-single-page-no-routing.md)), so the host needs no rewrite rule for deep links.
- Serve it over **HTTPS only**. Turn on HSTS if the host offers it.

## Keep one origin

Saved data lives in the browser's IndexedDB, which belongs to one origin (scheme + domain + port). If the app later moves to another domain or subdomain, users open an empty app and their data stays behind at the old address. Choose the final domain before people start using it. If it must change, plan the move first (the JSON export in ticket 36 is the only way to carry data over).

## Content-Security-Policy

The policy has two parts. The browser enforces both.

1. **Scripts: already in the build.** The production build sets `security.autoCsp` in `angular.json`. The CLI hashes every inline script and adds a `<meta http-equiv="Content-Security-Policy">` tag to `index.html` (`script-src 'strict-dynamic' 'sha256-…' https: 'unsafe-inline'`, `object-src 'none'`, `base-uri 'self'`; browsers that support hashes ignore the `https:` and `'unsafe-inline'` fallbacks). It needs no nonce and works on any static host.
   - What it blocks: injected HTML with inline handlers (`<img onerror=…>`), `javascript:` URLs and inline scripts it didn't hash. What it allows: a script created by code that already runs (`'strict-dynamic'`). So the CSP is a second line of defence. The first is the AGENTS.md rule: never bind user text as HTML.
2. **Everything else: send it as an HTTP header from the host.** Some directives (`frame-ancestors`) only work in a header, and Angular adds component styles as inline `<style>` elements, so styles need `'unsafe-inline'`:

```
Content-Security-Policy: style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; media-src 'none'; worker-src 'none'; form-action 'none'; frame-ancestors 'none'
```

- Do **not** put `default-src` or `script-src` in this header. A second policy with either one blocks the hashed loader script in the meta tag, and the page stays blank.
- `img-src data:` is needed for the select chevron (an inline SVG in `src/app/shared/_subscription-select.scss`).
- `connect-src 'self'`: the app makes no network calls. If one is ever added, its origin goes here.

## Other headers

```
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

## Caching

- `index.html`: `Cache-Control: no-cache`, so a new deploy is picked up on the next visit. The CSP hashes live in this file, so a stale copy can't load newer scripts.
- Hashed files (`main-*.js`, `styles-*.css`, `chunk-*.js`): `Cache-Control: public, max-age=31536000, immutable`.

## Check after each deploy

1. Open the site with the browser console open. There must be no CSP errors, and the app must load.
2. Add a subscription and reload. It must still be there.
3. Check the response headers above in the network panel, or with `curl -I https://<site>/`.
4. Optional: run the URL through a header checker such as securityheaders.com.
