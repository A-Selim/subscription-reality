# 41: A click outside the card dialog closes it

Status: resolved
Lane: small
Blocked by: 40
Test seam: Page seam (backdrop click closes; drag from an input ending outside does not)
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 11 (edit and delete); spec delete-dialog line. Replaces "backdrop clicks do nothing" from ticket 31.

## What to build

In `CardDialog`, a click on the backdrop closes the dialog the same way as Close, for both the edit and the delete dialog:

- Edit: discards the draft (ticket 40), focus returns to the card button.
- Delete: no change, no save, focus returns to the ✕.

Only treat it as a backdrop click when **both** the pointerdown and the click land on the `<dialog>` element itself, outside its content box. Otherwise, drag-selecting text in an input and releasing outside would close the dialog. The dialog's own padding counts as inside.

## Acceptance criteria

- [x] Clicking the backdrop closes the edit dialog without saving and returns focus to the card button.
- [x] Clicking the backdrop closes the delete dialog without changes and returns focus to the ✕.
- [x] Clicks inside the dialog (including its padding) don't close it.
- [x] Pressing inside a field and releasing over the backdrop doesn't close it.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

Card dialogs now close through the existing dismiss path only when both pointerdown and click land outside the dialog rectangle. Page-seam coverage verifies edit and delete dismissal, padding clicks, and field drags ending on the backdrop.
