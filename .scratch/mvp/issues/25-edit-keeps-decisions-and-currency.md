# 25: Edit keeps decisions and currency

Status: ready-for-agent
Lane: feature
Blocked by: 24
Test seam: Page seam; domain seam for re-estimating usage
Spec: `.scratch/mvp/spec.md` › User Stories 34–35, 78–79; Implementation Decisions › Edit and delete (fourth bullet), Domain module (re-estimating usage); Further Notes 2

## What to build

Editing never changes the **Review decision**, `usageConfirmed` or the **Preferred currency**. Changing the reason in the edit form re-estimates **Usage** only while usage is not confirmed. Once the user has made a decision in the review, usage is never overwritten by an estimate.

## Acceptance criteria

- [ ] An undecided Essential (Daily) subscription edited to Occasional Use shows usage Rarely.
- [ ] A subscription with a decision (usage confirmed as Daily) edited to Occasional Use keeps usage Daily.
- [ ] Editing a subscription marked Keep leaves it Keep; the savings card counts don't change.
- [ ] With preferred currency EUR, changing an old subscription's currency to USD and reloading leaves the add form's currency on EUR.
- [ ] Domain tests: re-estimate when unconfirmed; no change when confirmed.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
