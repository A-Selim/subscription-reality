# 30: Edit keeps decisions and currency

Status: resolved
Lane: feature
Blocked by: 29
Test seam: Page seam; domain seam for re-estimating usage
Spec: `.scratch/mvp/spec.md` › User Stories 34–35, 78–79; Implementation Decisions › Edit and delete (fourth bullet), Domain module (re-estimating usage); Further Notes 2

## What to build

Editing never changes the **Review decision**, `usageConfirmed` or the **Preferred currency**. Changing the reason in the edit form re-estimates **Usage** only while usage is not confirmed. Once the user has made a decision in the review, usage is never overwritten by an estimate.

## Acceptance criteria

- [x] An undecided Essential (Daily) subscription edited to Occasional Use shows usage Rarely.
- [x] A subscription with a decision (usage confirmed as Daily) edited to Occasional Use keeps usage Daily.
- [x] Editing a subscription marked Keep leaves it Keep; the savings card counts don't change.
- [x] With preferred currency EUR, changing an old subscription's currency to USD and reloading leaves the add form's currency on EUR.
- [x] Domain tests: re-estimate when unconfirmed; no change when confirmed.
- [x] `npm run build` and `npm test -- --watch=false` pass.
