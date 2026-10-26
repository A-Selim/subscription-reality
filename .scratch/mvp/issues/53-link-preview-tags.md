# 53: Link preview tags for LinkedIn and other sites

Status: resolved
Lane: small
Blocked by: 52
Test seam: Build output check by the orchestrator, then LinkedIn Post Inspector after deploy; existing tests must still pass
Spec: Owner request (2026-10-26). LinkedIn Post Inspector on `https://a-selim.github.io/subscription-reality/` warns "Add an og:description tag" and "Add an og:image tag". The shared post shows only the title and the domain.

## Why

When someone shares the live demo link, LinkedIn (and Slack, X, WhatsApp and others) builds a preview card from Open Graph tags in the page head. The page has only a `<title>`, so the card has no picture and no text.

## What to build

1. The orchestrator has already added `public/og-image.png` (1200×627, a screenshot of the hero section). Don't change or regenerate it.
2. In `src/index.html`, after the viewport `<meta>`, add these tags. Use absolute URLs (the scrapers need them):
   ```html
   <meta name="description" content="See what your subscriptions really cost per year and decide which ones are still worth keeping. Private: your data never leaves the browser.">
   <meta property="og:type" content="website">
   <meta property="og:site_name" content="Subscription Reality">
   <meta property="og:title" content="Subscription Reality">
   <meta property="og:description" content="See what your subscriptions really cost per year and decide which ones are still worth keeping. Private: your data never leaves the browser.">
   <meta property="og:url" content="https://a-selim.github.io/subscription-reality/">
   <meta property="og:image" content="https://a-selim.github.io/subscription-reality/og-image.png">
   <meta property="og:image:width" content="1200">
   <meta property="og:image:height" content="627">
   <meta property="og:image:alt" content="Subscription Reality: Small monthly charges add up quietly.">
   <meta name="twitter:card" content="summary_large_image">
   ```
3. `docs/deployment.md`: add a short "Link previews" section before "Check after each deploy". It says the Open Graph tags in `src/index.html` use absolute URLs on `https://a-selim.github.io/subscription-reality/`, so they must change if the site moves, and that `public/og-image.png` is a 1200×627 screenshot of the hero. Add a step to "Check after each deploy": after a change to the tags or the image, run the URL through https://www.linkedin.com/post-inspector/ so LinkedIn fetches the new preview.

## Do not

- Do not add a CSP `<meta>` tag or change `<base href>`, the favicon links or the `<title>` in `src/index.html`.
- Do not change `angular.json`, `src/app/`, the workflows or the prototype.
- Do not add dependencies. Do not commit.

## Acceptance criteria

- [x] `src/index.html` has exactly the tags above, and nothing else in it changed.
- [x] `npm run build -- --base-href /subscription-reality/` output `index.html` keeps the tags, the `autoCsp` meta tag and `<base href="/subscription-reality/">`, and `og-image.png` is in the output folder.
- [x] `docs/deployment.md` has the "Link previews" section and the new check step.
- [x] `npm test -- --watch=false` and `npm run build` pass.
- [ ] After deploy, LinkedIn Post Inspector shows the image, title and description with no warnings. (Orchestrator check.)

## Comments

- 2026-10-26: Implemented by Codex, reviewed by Claude. Tests (248) and both builds pass; sub-path build keeps the tags, autoCsp meta and base href, and ships og-image.png. Standards and spec reviews: no blocking findings.
