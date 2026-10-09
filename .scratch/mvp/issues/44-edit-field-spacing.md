# 44: Group each label with its field in the edit dialog

Status: ready-for-agent
Lane: small
Blocked by: none
Test seam: Manual visual check at 1280px and 320px
Spec: Owner decision (2026-10-09).

## What to build

In the edit dialog, `.edit-fields` is one grid with an 8px gap, so a label sits as close to the field above it as to its own field. Keep each label close to its own field (about 4–6px) and put clear space between fields (about 14–16px). Labels and controls stay as they are for accessibility.

## Acceptance criteria

- [ ] Each label is visibly closer to its own field than to the field above it.
- [ ] Fields have even, clear space between them.
- [ ] The dialog still scrolls and all actions can be reached at 320px and at 200% text size.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
