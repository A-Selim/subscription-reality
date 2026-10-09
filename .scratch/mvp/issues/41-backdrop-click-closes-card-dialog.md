# 41: A click outside the card dialog closes it

Status: ready-for-agent
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

- [ ] Clicking the backdrop closes the edit dialog without saving and returns focus to the card button.
- [ ] Clicking the backdrop closes the delete dialog without changes and returns focus to the ✕.
- [ ] Clicks inside the dialog (including its padding) don't close it.
- [ ] Pressing inside a field and releasing over the backdrop doesn't close it.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
