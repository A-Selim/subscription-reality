# 20: Before/after on reality cards

Status: ready-for-agent
Lane: small
Blocked by: 19
Test seam: Page seam; domain seam for the "after" total
Spec: `.scratch/mvp/spec.md` › User Stories 43–44; Implementation Decisions › Reality section (last bullet), Domain module (potential savings / "after" total)

## What to build

Each reality card shows the before/after comparison from the prototype: "Before review" = the currency's annual total, and "If you cancel the ones you no longer value" = annual total − potential savings in that currency. Subscriptions marked Cancel stay in the annual total.

## Acceptance criteria

- [ ] With €180 per year and nothing marked Cancel, both figures show €180.
- [ ] Marking a €120-per-year subscription Cancel changes "If you cancel…" to €60, while "Before review" and the big annual total stay €180.
- [ ] Each currency card shows its own before/after.
- [ ] Domain test for the "after" total per currency.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
