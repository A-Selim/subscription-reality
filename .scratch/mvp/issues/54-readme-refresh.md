# 54: README refresh after the move to GitHub Pages

Status: resolved
Lane: small
Blocked by: 52, 53
Test seam: README read-through by the orchestrator; existing tests and build must still pass
Spec: Owner request (2026-10-26), README suggestions 1–7.

## Why

The README still has two facts from before the move to GitHub Pages, and it doesn't credit the agents, state the app's limits, or show the phone layout.

## What to build

All changes are in `README.md`. Keep its voice: short plain sentences, no marketing words, no emoji.

1. **Documentation table:** the `docs/deployment.md` row's purpose becomes "Hosting on GitHub Pages, link previews, caching".
2. **Ticket count:** in "How it was built" step 2, replace "50 small tickets" with the real count of files in `.scratch/mvp/issues/` (run `ls .scratch/mvp/issues | wc -l` after this ticket file exists; it should be 53).
3. **Credits section:** add `## Credits` just before `## License`. Two bullets:
   - **OpenAI Codex**: wrote the implementation, one ticket at a time, test first.
   - **Claude Code** (Anthropic): planning support, tickets, and review of every change.
   Then one line: "Product decisions, the brief and the final call on every change: Ahmed Selim." Link to the "How it was built" section (`#how-it-was-built`).
4. **Limits section:** add `## Limits` after `## Features` (before `## Engineering highlights`). Bullets:
   - Data lives only in this browser on this device. There is no account and no sync between devices.
   - Clearing site data in the browser deletes your subscriptions. There is no export or import yet.
   - Currencies are never converted, so each currency has its own totals.
   - Other projects on the same `a-selim.github.io` address share browser storage with this app (link to `docs/deployment.md#keep-one-origin`).
5. **Badges:** on the line with the CI badge, add after it, separated by spaces:
   - Deploy: `[![Deploy](https://github.com/A-Selim/subscription-reality/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/A-Selim/subscription-reality/actions/workflows/deploy-pages.yml)`
   - License: `[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)`
   - Angular: `[![Angular 22](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)](https://angular.dev)`
6. **Phone screenshots:** the orchestrator added `docs/images/mobile-subscriptions.png` and `docs/images/mobile-reality.png` (390 px wide phone screenshots). After the two existing screenshots in `## Features`, add one line: "On a phone:" then both images side by side, using `<p><img src="docs/images/mobile-subscriptions.png" alt="…" width="260"> <img src="docs/images/mobile-reality.png" alt="…" width="260"></p>`. Alt texts: "Subscription cards stacked on a phone screen, each with its monthly price, annual cost, reason and usage" and "The yearly total of €1,667 on a phone screen, with the before and after comparison".
7. **Decision records:** in "How it was built" step 1, after the `CONTEXT.md` sentence, add: "Decisions that are hard to undo are recorded as ADRs, such as [hosting on GitHub Pages](docs/adr/0002-host-on-github-pages.md)."

## Do not

- Do not change any other file. Do not change the existing images, the demo GIF line or other sections beyond the items above.
- Do not add `docs/images/linkedin.gif` or `docs/images/linkedin.mp4` anywhere.
- Do not commit.

## Acceptance criteria

- [x] Items 1–7 are in `README.md` as described, and nothing else in it changed.
- [x] Every relative link and image path in `README.md` points to a file that exists.
- [x] `npm test -- --watch=false` and `npm run build` pass.

## Comments

- 2026-10-26: Implemented by Codex, reviewed by Claude. Links and images resolve; tests (248) and build pass. Claude reworded the ticket count to separate the 50 first-version tickets from the follow-ups.
