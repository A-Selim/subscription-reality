# 16: Review card: reason and usage

Status: resolved
Lane: feature
Blocked by: 15
Test seam: Page seam; domain seam for the review queue
Spec: `.scratch/mvp/spec.md` › User Stories 47–53, 62; Implementation Decisions › Review (first, fourth and sixth bullets); Further Notes 1

## What to build

Once a subscription exists, the review card is no longer dimmed. It shows one subscription at a time: the first undecided one in the order added (the position is never saved). It shows the monogram, name, **Annual cost** and **Monthly cost**.

It asks "Why do you still have it?" with the six reasons, and "How often do you actually use it?" with the five usages. Each is a group of buttons (`role="group"`, labelled by its question) with `aria-pressed` on the current value. Choosing one saves straight away (totals and counts react), and focus stays on the chosen button. Changing the reason here never re-estimates usage.

The Keep / Unsure / Cancel decisions are ticket 17.

## Acceptance criteria

- [x] With two subscriptions, the review shows the first one added, with its annual and monthly cost.
- [x] Its current reason and usage buttons are pressed (`aria-pressed="true"`); the others are not.
- [x] Choosing usage Rarely updates the rarely used count on the reality card at once, and the subscription card shows Rarely.
- [x] Choosing a new reason in the review does not change usage.
- [x] Both groups have an accessible name equal to their question.
- [x] After a reload, the review shows the same first undecided subscription with the saved reason and usage.
- [x] Domain tests: the queue lists undecided subscriptions in insertion order.
- [x] `npm run build` and `npm test -- --watch=false` pass.
