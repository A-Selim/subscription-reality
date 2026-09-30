# 10: Add form validation

Status: resolved
Lane: feature
Blocked by: 09, 07b
Test seam: Page seam; domain seam for price and name validity
Spec: `.scratch/mvp/spec.md` › User Stories 18, 20–24; Implementation Decisions › Add form (validation failure), Domain module (price and name validity)

## What to build

The add form stops invalid input and explains it where the user is looking.

Rules (schema-based, reusable for editing later):
- name: trimmed, required, at most 40 characters
- price: required, greater than 0, at most 2 decimal places
- billing frequency and currency: required

On a failed add, nothing is added. The first invalid field (in form order) gets a red outline, `aria-invalid="true"` and focus. The toast from ticket 07 shows the error just above Add and announces it. Each invalid field also links through `aria-describedby` to its own visually hidden error text, which stays until the field is valid again.

Invalid state and focus: the "red outline" on an invalid field is the field's border, drawn the same way as the focus style from ticket 07b (a solid 2px edge: `border-color` plus a 1px inset `box-shadow`, with a transparent outline). Cover both cases for inputs and selects: invalid and not focused shows the red edge, and invalid and focused (the first invalid field gets focus) keeps the **red** edge instead of the accent one, so the error is not hidden by the focus style. The invalid rule must win over the plain `:focus` rule: write it as `[aria-invalid="true"]:focus` (higher specificity than `.field-group input:focus`), or declare it after that rule. `--red` on white is about 5.6:1, above the 3:1 needed.

Error toast style: the toast from ticket 07 gets a `variant` (`success` or `error`, default `success`), for example `show(text, variant)`. Validation toasts use the `error` variant: `--red-soft` background, `--red` text (5.01:1 contrast, passes AA), a 1px `--red` border and a decorative ⚠ icon (`aria-hidden="true"`, so colour is not the only cue). The `success` look stays as it is. It uses only existing palette tokens, the same pair as the Cancel decision and the invalid-field outline. The error toast keeps the same 4-second delay and the same rules: always-present `role="status"` region, no focus steal, repeated messages announced again.

The duplicate-name rule is ticket 11.

## Acceptance criteria

- [x] Pressing Add subscription with an empty form adds nothing, focuses the name field, outlines it in red and shows a toast above Add.
- [x] A price of 0, a negative price, or 9.999 is refused with a toast, and the price field gets focus.
- [x] Missing billing frequency or currency is refused in the same way.
- [x] A name with surrounding spaces is saved trimmed; a name longer than 40 characters cannot be saved.
- [x] An invalid field has `aria-invalid="true"` and an `aria-describedby` error text that stays after the toast hides and goes away once the field is valid.
- [x] Validation toasts use the error variant (`--red-soft` background, `--red` text, `--red` border, decorative ⚠ icon), while "Subscription added" keeps the success look. The error text meets WCAG AA contrast.
- [x] Refusing the same invalid add twice in a row shows and announces the error toast both times.
- [x] Domain tests cover price 0, negative, 3 decimals, 2 decimals, and name empty, whitespace-only, 40 and 41 characters.
- [x] `npm run build` and `npm test -- --watch=false` pass.
