# 22: Insight name selection

Status: ready-for-agent
Lane: feature
Blocked by: 21
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Story 71; Implementation Decisions › Review (third bullet); Further Notes 6

## What to build

Each review candidate name in the insight's muted line becomes a button. Selecting it brings that subscription up in the review card, even if it already has a decision, and moves focus to the review card's heading.

After a decision on it, the review goes back to where it was:
- if a _Review again_ pass is active, the pass continues from its current position;
- otherwise the normal rule applies: the first undecided subscription, or _Review complete_.

## Acceptance criteria

- [ ] Selecting a candidate name shows that subscription in the review and focuses the review heading.
- [ ] It works for a candidate that already has a decision, with that decision pressed.
- [ ] After deciding on it (no pass active), the review shows the first undecided subscription, or _Review complete_ if none.
- [ ] During a _Review again_ pass, after deciding on the selected candidate, the pass continues at the position it was at before.
- [ ] The names are keyboard-operable buttons with the subscription name as their accessible name.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
