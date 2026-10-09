# 33: Edit opens in the card dialog

Status: resolved
Lane: feature
Blocked by: 32
Test seam: Page seam (migrate the existing edit tests to the dialog); manual check of native modal focus in a real browser
Spec: Owner decision (2026-10-09): "edit subscription needs to be on a dialog; when the user clicks the card itself, the card opens as a dialog with the edit form". Replaces "opens it in place" in `docs/agreed-changes.md` › 11 and spec story 74.

## What to build

Clicking a card opens the **card dialog** from ticket 31 with an edit body, instead of opening the edit form in place. Every card in the list stays in read view and always shows its ✕.

The edit body is today's edit form: name, price, billing frequency, currency and reason, the annual cost, the toast and **Done**. It also has a text **Close** button. It has no Delete action; delete is only the card's ✕.

- **Title:** the dialog's accessible name is "Edit {name}". Its card header shows the saved values.
- **Saving stays live:** each time the whole form is valid, it is applied and saved, so totals update while the user edits. While any field is invalid, the last valid values stay in effect.
- **Done:** if the form is invalid, the dialog stays open, the toast shows the error and focus moves to the first invalid field (as today). If it is valid, the dialog closes.
- **Close and Escape always close.** The browser may force-close a modal on a repeated Escape anyway, so refusing to close can't be guaranteed.
  - With a valid form, closing works like Done: the changes stay.
  - With any invalid field, closing undoes the whole edit (owner decision, 2026-10-09): the subscription goes back to exactly the values it had when the dialog opened, including valid changes made earlier in the same dialog, and that is saved. Totals and the rest of the page return to their earlier state, as if the user changed nothing.
  - A short line in the dialog explains this: "Changes save as you type. If you close with an error, all changes are undone."
  - Reopening loads the saved values with no old errors or draft.
- **Focus:** opens on the name field; every way of closing returns focus to that card's card button.
- **Rules unchanged:** editing never changes the **Review decision**, `usageConfirmed` or the **Preferred currency**; changing the reason re-estimates usage only while usage is unconfirmed (ticket 30).
- **Fits small screens:** at 320px and at 200% text size the dialog scrolls vertically and every action can be reached.

Update `docs/agreed-changes.md` › 11 and, in `.scratch/mvp/spec.md`, story 74 and the edit decisions.

## Acceptance criteria

- [x] Clicking a card, or pressing Enter or Space on its card button, opens the edit dialog named "Edit {name}" with the five fields, and focus is on the name field.
- [x] No card in the list opens in place any more; every card shows its ✕.
- [x] Changing the price to a valid value updates the totals and is saved; clearing it keeps the old price in effect.
- [x] Done with an invalid field keeps the dialog open, shows the toast and focuses the first invalid field; Done with a valid form closes it.
- [x] Close and Escape with a valid form keep the changes.
- [x] Change the price to a valid value, then clear the name, then press Close (and separately Escape): the dialog closes, the price is back to its value before the dialog opened, the totals match, and a reload shows the original values.
- [x] Reopening after any close shows the saved values and no error.
- [x] Every way of closing returns focus to that card's card button; Tab stays inside the dialog while it is open.
- [x] Ticket 30's rules still hold: decision, `usageConfirmed` and preferred currency don't change on edit.
- [x] The dialog scrolls and all actions are reachable at 320px width and at 200% text size.
- [x] The existing edit page tests (tickets 23, 24 and 30) are moved to the dialog without weakening their assertions.
- [x] `docs/agreed-changes.md` › 11 and spec story 74 describe the edit dialog.
- [x] `npm run build` and `npm test -- --watch=false` pass; the modal focus behaviour is checked in a real browser.

## Comments

- Checked in real Chrome (Playwright):
  - the dialog is named "Edit {name}", focus starts on the name field, and Tab stays inside the dialog
  - after a valid price change, clearing the name and pressing Escape undoes everything (also after a reload), and focus returns to the card button
  - Done with a valid form keeps the change
  - at 320px with 200% root text the dialog body scrolls and Done and Close are reachable
  - no console errors
- The ticket 31 and 32 tests that relied on an in-place edit form on another card were rewritten. That situation can no longer happen, because only one modal can be open.
