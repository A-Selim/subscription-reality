# 10: Add form validation

Status: ready-for-agent
Lane: feature
Blocked by: 09
Test seam: Page seam; domain seam for price and name validity
Spec: `.scratch/mvp/spec.md` › User Stories 18, 20–24; Implementation Decisions › Add form (validation failure), Domain module (price and name validity)

## What to build

The add form stops invalid input and explains it where the user is looking.

Rules (schema-based, reusable for editing later):
- name: trimmed, required, at most 40 characters
- price: required, greater than 0, at most 2 decimal places
- billing frequency and currency: required

On a failed add, nothing is added. The first invalid field (in form order) gets a red outline, `aria-invalid="true"` and focus. The toast from ticket 07 shows the error just above Add and announces it. Each invalid field also links through `aria-describedby` to its own visually hidden error text, which stays until the field is valid again.

The duplicate-name rule is ticket 11.

## Acceptance criteria

- [ ] Pressing Add with an empty form adds nothing, focuses the name field, outlines it in red and shows a toast above Add.
- [ ] A price of 0, a negative price, or 9.999 is refused with a toast, and the price field gets focus.
- [ ] Missing billing frequency or currency is refused in the same way.
- [ ] A name with surrounding spaces is saved trimmed; a name longer than 40 characters cannot be saved.
- [ ] An invalid field has `aria-invalid="true"` and an `aria-describedby` error text that stays after the toast hides and goes away once the field is valid.
- [ ] Domain tests cover price 0, negative, 3 decimals, 2 decimals, and name empty, whitespace-only, 40 and 41 characters.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
