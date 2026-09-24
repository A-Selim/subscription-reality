# 27: Not yet, keep it

Status: ready-for-agent
Lane: small
Blocked by: 26
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Story 84; Implementation Decisions › Edit and delete (last bullet), State service (keep-as-cancel intent); Further Notes 2

## What to build

In the delete question, **Not yet, keep it** keeps the subscription and sets its **Review decision** to Cancel, so it counts toward **Potential savings** as a reminder. It does **not** confirm usage, because the user never answered the usage question. It closes the question and the edit form, and focus returns to the card.

## Acceptance criteria

- [ ] Not yet, keep it keeps the card, and the savings card line for its currency goes up by its annual cost.
- [ ] The Cancel count goes up by one.
- [ ] The question and edit form close, and focus is on the card.
- [ ] Afterwards, editing its reason still re-estimates usage (usage stays unconfirmed).
- [ ] `npm run build` and `npm test -- --watch=false` pass.
