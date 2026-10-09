# 50: Delete dialog buttons on opposite sides, delete in soft red

Status: resolved
Lane: small
Blocked by: none
Test seam: Manual browser check (layout and colour); existing page tests must still pass
Spec: Owner request (2026-10-09). `docs/agreed-changes.md` › 11 CRUD › Delete › Button layout.

## Why

In the delete card dialog, _Yes, delete it_ and _Not yet, keep it_ sit next to each other in the same neutral style. The owner wants them apart, one on each side, and one of them coloured to match the theme.

## What to build

Styles only, in `src/app/recurring-life/recurring-life.scss` (and a class in `recurring-life.html` if needed). Markup order and the button text stay as they are.

1. `.dialog-actions`: put _Yes, delete it_ on the left edge and _Not yet, keep it_ on the right edge (`justify-content: space-between`). Keep `flex-wrap: wrap` and the 10px gap, so on a narrow dialog they stack instead of overflowing.
2. _Yes, delete it_: give it a class (e.g. `delete`) styled with the theme's soft red: `color: var(--red)`, `border-color: var(--red)`, `background: var(--red-soft)`. Keep the shared size, radius, weight and the accent focus outline. Add a hover state that stays readable (e.g. a slightly stronger red-soft or `--red` background with white text; any text/background pair must meet 4.5:1).
3. _Not yet, keep it_: unchanged (neutral).
4. Only the delete dialog changes. The edit dialog's actions must look the same as before.

## Do not

- Do not change `src/styles.scss` tokens, the dialog markup order, or the button labels (tests find buttons by these names).
- Do not touch `docs/` or the prototype.
- Do not commit.

## Acceptance criteria

- [x] In the delete dialog, _Yes, delete it_ is at the left edge and _Not yet, keep it_ at the right edge on desktop; on a 320px-wide screen they wrap without horizontal scroll.
- [x] _Yes, delete it_ shows red text and border on `--red-soft`; contrast is at least 4.5:1 in normal and hover states; the focus outline is visible.
- [x] The edit dialog looks unchanged.
- [x] axe reports no new violations in the delete dialog.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

Implemented the delete-only action styling; `npm test -- --watch=false` passes (3 files, 248 tests) and `npm run build` passes. Browser and axe checks remain for the orchestrator.

- Orchestrator (2026-10-09): checked in Chromium. Desktop: _Yes, delete it_ at the left edge, _Not yet, keep it_ at the right edge. At 320px they stack, left-aligned, no horizontal scroll. Delete is `--red` on `--red-soft` (5.0:1); hover is white on `--red` (5.7:1); focus outline unchanged. axe: 0 violations in the delete dialog. `.dialog-actions` is only used by the delete dialog, so the edit dialog is unchanged. 248 tests pass; build passes.
