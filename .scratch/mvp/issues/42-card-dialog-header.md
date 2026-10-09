# 42: Card dialog header: corner Close, larger name, cost in the other unit

Status: ready-for-agent
Lane: small
Blocked by: 40
Test seam: Page seam (accessible names unchanged, other-unit text); manual visual check at 1280px and 320px
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 11 (Card dialog header, Edit).

## What to build

Changes to the shared `CardDialog` (affects both edit and delete) and the edit body in `recurring-life.html`:

- **Close** becomes a ✕ icon button with `aria-label="Close"`, alone on its own row in the top-right corner, with space below it before the card header. It keeps its role: focused first in the delete dialog, closes the dialog. Touch target at least 44px.
- **Name** in the header is larger (about 22px, was 18px), in both dialogs. Long names still wrap.
- **Edit title:** "Edit {name}" (`#edit-title`) is visually hidden, not removed. It stays the dialog's accessible name.
- **Other unit under the price (edit dialog only):** under the header price, show "€120 / year" when billing is monthly and "€10 / month" when billing is yearly. It uses the draft when valid, otherwise the saved values (the preview from ticket 40). Remove the old "Annual cost …" line at the bottom of the edit form.

## Acceptance criteria

- [ ] Both dialogs show a ✕ in the top-right corner with space below it; its accessible name is "Close".
- [ ] The edit dialog's accessible name is still "Edit {name}", with no visible "Edit {name}" text.
- [ ] The header name is larger in both dialogs and long names don't overflow at 320px.
- [ ] A monthly subscription shows its annual cost under the price; a yearly one shows its monthly cost.
- [ ] The delete dialog still focuses Close first.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
