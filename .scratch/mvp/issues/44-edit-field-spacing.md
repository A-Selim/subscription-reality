# 44: Group each label with its field in the edit dialog

Status: resolved
Lane: small
Blocked by: none
Test seam: Manual visual check at 1280px and 320px
Spec: Owner decision (2026-10-09).

## What to build

In the edit dialog, `.edit-fields` is one grid with an 8px gap, so a label sits as close to the field above it as to its own field. Keep each label close to its own field (about 4–6px) and put clear space between fields (about 14–16px). Labels and controls stay as they are for accessibility.

## Acceptance criteria

- [x] Each label is visibly closer to its own field than to the field above it.
- [x] Fields have even, clear space between them.
- [x] The dialog still scrolls and all actions can be reached at 320px and at 200% text size.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

Grouped edit labels with their controls using a 5px label gap and 15px space between fields. The visual layout at 1280px and 320px, including 200% text size, needs a manual browser check. Tests pass, but the production build aborts in Node's allocator during Angular's build phase before it reports an application error.

- Orchestrator: replaced the `:host-context` and global-style approach with a `.edit-field` wrapper per field (5px label gap, 15px between fields). Build verified outside the sandbox. Status is ready-for-human until the browser check.
- Orchestrator browser check (2026-10-09, Chromium via Playwright, 1280px, 965px, 375px, 320px and 200% text): passed.
