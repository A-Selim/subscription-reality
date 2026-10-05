# 23: Open and close the edit form

Status: resolved
Lane: feature
Blocked by: 22
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Stories 74–76, 80; Implementation Decisions › Edit and delete (first three bullets)

## What to build

Selecting a subscription card (a keyboard-operable button) turns that card into an in-place edit form with the five creation fields (name, price, billing frequency, currency, reason), filled with the current values. It reuses the add form's model.

Changes apply live: while the whole form is valid, each change updates and saves the subscription, so totals update as the user edits. A **Done** button closes the form, and focus returns to the card.

In this ticket, assume valid input. Invalid input and Done blocking are ticket 24. Decision, usage and preferred-currency rules are ticket 25.

## Acceptance criteria

- [x] Clicking a card, or pressing Enter/Space on it, opens the edit form on that card with its current values.
- [x] Changing the price from €10 to €12 monthly updates the reality card's annual total to include €144 without pressing Done.
- [x] Changing the billing frequency updates the card's annual cost at once.
- [x] Done closes the form, the card shows the new values, and focus is on that card.
- [x] A reload after an edit shows the edited values.
- [x] `npm run build` and `npm test -- --watch=false` pass.
