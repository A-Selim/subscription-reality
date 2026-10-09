# 31: Delete ✕, the card dialog, and Yes, delete it

Status: ready-for-agent
Lane: feature
Blocked by: 30
Test seam: Page seam; manual check of native modal focus in a real browser
Spec: Owner decision (2026-10-09): "delete is an ✕ button on every card; clicking it opens the card, with its current design, as a dialog with the confirm question". `docs/agreed-changes.md` › 11 (question and answers unchanged); `.scratch/mvp/spec.md` › User Stories 81–83, 85; Implementation Decisions › Edit and delete; Further Notes 14

## What to build

Every subscription card gets an **✕** button that deletes. It opens the **card dialog**: a native modal `<dialog>` that looks like the subscription card (monogram, price, name, colours, radius). This ticket builds the shell and its delete body. Ticket 33 reuses the same shell for editing.

The delete body shows:

> Did you already cancel {name}?
> Deleting it here doesn't stop the payment.

with **Yes, delete it**, **Not yet, keep it** (its behaviour is ticket 32; both ship together, so no release has a no-op Not yet) and a text button **Close**. Close is a word, not a second ✕, because on the cards the ✕ means delete. It is not called "Cancel", because Cancel is a **Review decision**.

- **The ✕ on the card:** always visible (not on hover only), in the card's top corner, with space kept so it doesn't overlap the price. It is a real button next to the card button, not inside it, and above the card's stretched click area, so clicking it never opens edit. Its accessible name is "Delete {name}"; the glyph is hidden from screen readers. It comes after the card button in tab order.
- **The dialog:** opened with `showModal()`. Its accessible name is the question, and its description is the payment sentence. The page behind it is inert. Focus starts on **Close**, the only choice that changes nothing.
- **Close and Escape:** close the dialog with no change and no save. Focus returns to the ✕ that opened it. A click on the backdrop does nothing.
- **Yes, delete it:** removes the subscription and saves. Totals, decision counts, reality cards, savings lines, review and insight all update; a currency's reality card disappears with its last subscription. Focus moves to the next card's card button, or to the previous card if it was the last. If no subscriptions remain, the page is back in the empty state: the add form is revealed first, then its name field gets focus.
- **The dialog belongs to the recurring-life section,** not to the card it shows, so deleting that card can't destroy the open dialog. The dialog closes before its body is removed, and reopening it never reuses an earlier answer.
- **Until ticket 33,** edit still opens in place. If another card's edit form is open when a ✕ is clicked, it keeps its input and validation state (the modal only makes it inert). After Yes, if the neighbouring card is in edit view, focus goes to its name field.

Update `docs/agreed-changes.md` › 11 and, in `.scratch/mvp/spec.md`, the stories 81–85, "Edit and delete", the component list ("delete question" becomes the card dialog), the state-service wording and the testing references.

## Acceptance criteria

- [ ] Every card in read view shows an ✕ named "Delete {name}". It follows the card button in tab order, has a visible focus indicator, and clicking it never opens edit.
- [ ] The ✕ target is at least 24×24px (aim for 44×44), the icon has at least 3:1 contrast, and it doesn't overlap the price at 320px width.
- [ ] Clicking ✕ opens the modal card dialog with the subscription's look. Its name is "Did you already cancel {name}?", its description is the payment sentence, and focus is on Close.
- [ ] Tab and Shift+Tab stay inside the dialog; the page behind it is inert.
- [ ] Close and Escape close the dialog with no change to the subscription and no save, and focus returns to the ✕. A backdrop click does nothing.
- [ ] Yes, delete it removes the card, and focus moves to the next card (or the previous one if it was the last).
- [ ] Deleting the only USD subscription removes the USD reality card and the USD savings line.
- [ ] Deleting the last subscription returns to the empty state with the add form shown and its name field focused; the other sections are dimmed again.
- [ ] Deleting a subscription during a _Review again_ pass drops it from the pass. Deleting the subscription shown in the review card shows what the review would show without it, without moving focus there.
- [ ] Deleting the review candidate picked from the insight (ticket 22) clears that pick.
- [ ] Emptying a currency and then adding a subscription in it again puts its reality card at the end.
- [ ] An open in-place edit form on another card keeps its input while the dialog is open and after it closes.
- [ ] A reload after deleting doesn't bring the subscription back.
- [ ] `docs/agreed-changes.md` › 11 and the spec describe the ✕ and the card dialog.
- [ ] `npm run build` and `npm test -- --watch=false` pass; the modal focus behaviour is checked in a real browser.
