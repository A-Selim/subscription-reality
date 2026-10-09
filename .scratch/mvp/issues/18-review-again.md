# 18: Review again

Status: resolved
Lane: feature
Blocked by: 17
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Story 59; Implementation Decisions › Review (second bullet); Further Notes 11

## What to build

_Review complete_ offers _Review again_. It starts an in-memory pass over every subscription in the order added, showing each one's current decision as pressed. Deciding moves to the next subscription in the pass. At the end, _Review complete_ shows again.

The pass reads the live list: a subscription added during the pass appears at the end of the same pass (undecided). A deleted one drops out (delete arrives in ticket 31; the pass logic must already read the live list).

## Acceptance criteria

- [x] After finishing the review, _Review again_ shows the first subscription added, with its earlier decision pressed.
- [x] Changing that decision to Cancel records it and moves to the second subscription.
- [x] After the last subscription, _Review complete_ shows again.
- [x] Adding a subscription during the pass makes it appear at the end of the same pass, undecided.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

- The pass position is the `sequence` of the last subscription handled, kept in memory only. A decision only moves the pass when it is on the subscription the pass is showing, so insight name selection (ticket 22) can bring up another one without jumping the pass.
- Delete (ticket 31) should clear the pass position when no subscription remains after it; today it just falls back to the normal rule, which shows the right thing.
