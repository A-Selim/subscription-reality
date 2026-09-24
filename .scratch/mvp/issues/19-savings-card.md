# 19: Savings card

Status: ready-for-agent
Lane: feature
Blocked by: 18
Test seam: Page seam; domain seam for potential savings and decision counts
Spec: `.scratch/mvp/spec.md` › User Stories 64–68; Implementation Decisions › Savings card (first two bullets); Further Notes 9

## What to build

Once a subscription exists, the dark savings card next to the review is no longer dimmed. It shows _Potential annual savings_ as one line for each currency that has subscriptions, in the same order as the reality cards. **Potential savings** is the annual cost of subscriptions with the Cancel decision, and zero lines are shown (e.g. €0 and $0 when nothing is marked Cancel). It also shows Keep, Unsure and Cancel counts across all currencies. Unsure only counts; it never adds to savings.

The insight box is ticket 21.

## Acceptance criteria

- [ ] With EUR and USD subscriptions and no decisions, the card shows €0 and $0 lines, in reality-card order.
- [ ] Marking a monthly €10 subscription Cancel makes the EUR line €120 at once; the USD line stays $0.
- [ ] Marking one Unsure raises the Unsure count and leaves savings unchanged.
- [ ] Counts for Keep / Unsure / Cancel add up across currencies.
- [ ] Cancelled subscriptions still count in the reality card totals.
- [ ] Domain tests: savings per currency with zero entries; decision counts.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
