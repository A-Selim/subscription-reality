# 32: Not yet, keep it

Status: resolved
Lane: small
Blocked by: 31
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Story 84; Implementation Decisions › Edit and delete, State service (keep-as-cancel intent); Further Notes 2

## What to build

In the card dialog's delete body (ticket 31), **Not yet, keep it** keeps the subscription and sets its **Review decision** to Cancel through the keep-as-cancel intent, so it counts toward **Potential savings** as a reminder. It saves, closes the dialog, and returns focus to that card's ✕.

It sets the decision only. It does not confirm usage, because the user never answered the usage question: `usage` and `usageConfirmed` stay exactly as they were (false stays false, true stays true). It doesn't go through the review's decide intent and doesn't move the _Review again_ pass; the review simply reflects the new decision.

## Acceptance criteria

- [x] Not yet, keep it keeps the card in the list and in **Recurring cost**; the savings line for its currency goes up by its annual cost.
- [x] An undecided, Keep or Unsure subscription becomes Cancel and the counts change by one; an already-Cancel subscription isn't counted twice.
- [x] Usage and `usageConfirmed` don't change, including usage that was already confirmed. Afterwards, editing its reason still re-estimates usage only if usage is unconfirmed.
- [x] The dialog closes and focus is on that card's ✕; an open in-place edit form on another card keeps its input.
- [x] A reload keeps the Cancel decision and the original usage state.
- [x] `npm run build` and `npm test -- --watch=false` pass.
