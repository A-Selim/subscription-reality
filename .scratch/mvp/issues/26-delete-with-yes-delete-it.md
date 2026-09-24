# 26: Delete: "Did you already cancel?" and Yes, delete it

Status: ready-for-agent
Lane: feature
Blocked by: 25
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Stories 81–83, 85; Implementation Decisions › Edit and delete (last bullet); Further Notes 14

## What to build

The edit form has a **Delete** button. It opens an inline question on the card and moves focus to it:

> Did you already cancel {name}? Deleting it here doesn't stop the payment.

with **Yes, delete it** and **Not yet, keep it** (ticket 27 builds Not yet; here it may just close the question).

**Yes, delete it** removes the subscription and saves. Focus moves to the next card, or to the previous one if it was the last. If no subscriptions remain, the page is back in the empty state: the add form is revealed there first, then its name field gets focus. Totals, reality cards, review, savings and insight all update. A currency's reality card disappears when its last subscription is deleted.

## Acceptance criteria

- [ ] Delete opens the question with the subscription's name, and focus moves to the question.
- [ ] Yes, delete it removes the card and focus moves to the next card.
- [ ] Deleting the only USD subscription removes the USD reality card and the USD savings line.
- [ ] Deleting the last subscription returns to the empty state with the add form shown and its name field focused; the other sections are dimmed again.
- [ ] Deleting the last card in the list moves focus to the card before it.
- [ ] Deleting a subscription during a _Review again_ pass drops it from the pass.
- [ ] Emptying a currency and then adding a subscription in it again puts its reality card at the end.
- [ ] A reload after deleting doesn't bring the subscription back.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
