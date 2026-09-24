# 17: Review decisions and progress

Status: ready-for-agent
Lane: feature
Blocked by: 16
Test seam: Page seam (plus a reload through the in-memory fake)
Spec: `.scratch/mvp/spec.md` › User Stories 35, 54–58, 60, 63; Implementation Decisions › Review (fifth, sixth and seventh bullets), State service (`decide` intent)

## What to build

The review card gets Keep, Unsure and Cancel buttons. Choosing one records the **Review decision**, sets `usageConfirmed` to true, and moves on to the next undecided subscription. There is no extra message on Cancel. Focus moves to the next subscription's review heading, or to the _Review complete_ heading when none are left.

A progress bar shows decided / total, with an accessible label such as "3 of 7 reviewed". When no undecided subscriptions remain, the card shows _Review complete_. A subscription added later joins the queue as undecided.

Code and data use `unsure`, never `maybe`.

## Acceptance criteria

- [ ] With three subscriptions, pressing Keep on the first shows the second and moves focus to its review heading.
- [ ] The progress bar reads "1 of 3 reviewed" after one decision.
- [ ] After deciding all three, _Review complete_ shows and has focus.
- [ ] Adding a new subscription after _Review complete_ brings it up in the review as undecided, and progress reads "3 of 4 reviewed".
- [ ] Choosing Cancel shows no extra message.
- [ ] Reloading halfway through resumes at the first undecided subscription with the decisions kept.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
