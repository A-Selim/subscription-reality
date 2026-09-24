# 12: Preferred currency

Status: ready-for-agent
Lane: feature
Blocked by: 11
Test seam: Page seam; storage seam for the reload case
Spec: `.scratch/mvp/spec.md` › User Stories 14–17; Implementation Decisions › State service (preferred currency), Add form (initial values)

## What to build

The currency field starts blank on a first visit. When a subscription is created, its currency becomes the **Preferred currency**, and the currency field starts on it for the next add, including after a reload. Changing the dropdown without adding does not change it. (Editing never changes it either; ticket 25 checks that.)

## Acceptance criteria

- [ ] First visit: the currency field is blank.
- [ ] Add a subscription in USD: the form resets with currency USD.
- [ ] Change the dropdown to GBP, don't add, and reload: the currency field starts on USD.
- [ ] Add one in EGP, then reload: the currency field starts on EGP.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
