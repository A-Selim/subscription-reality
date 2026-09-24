# 18: Review again

Status: ready-for-agent
Lane: feature
Blocked by: 17
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Story 59; Implementation Decisions › Review (second bullet); Further Notes 11

## What to build

_Review complete_ offers _Review again_. It starts an in-memory pass over every subscription in the order added, showing each one's current decision as pressed. Deciding moves to the next subscription in the pass. At the end, _Review complete_ shows again.

The pass reads the live list: a subscription added during the pass appears at the end of the same pass (undecided). A deleted one drops out (delete arrives in ticket 26; the pass logic must already read the live list).

## Acceptance criteria

- [ ] After finishing the review, _Review again_ shows the first subscription added, with its earlier decision pressed.
- [ ] Changing that decision to Cancel records it and moves to the second subscription.
- [ ] After the last subscription, _Review complete_ shows again.
- [ ] Adding a subscription during the pass makes it appear at the end of the same pass, undecided.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
