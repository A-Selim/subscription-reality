# 48: No spinner on the edit Price; placeholder options can't be picked

Status: ready-for-agent
Lane: bug
Blocked by: none
Test seam: Page seam (the placeholder options are disabled); manual browser check for the spinner
Spec: Owner decision (2026-10-09), after a Safari check. `docs/agreed-changes.md` › 2 (Layout).

## Why

Two small mismatches the owner saw in Safari:

1. The add form hides the Price field's up/down spinner arrows, but the edit dialog's Price still shows them.
2. In the add form, the blank options "Billing" and "Currency" appear in the open list and can be picked. Picking one just empties the field again.

## What to build

1. In the edit dialog (`src/app/edit-subscription-form/`), hide the Price input's spinner arrows the same way the add form does (`appearance: textfield` plus the `::-webkit-inner-spin-button` / `::-webkit-outer-spin-button` reset in `src/app/add-subscription-form/add-subscription-form.scss`). Share the rule rather than copy it if that stays simple, e.g. in a small partial under `src/app/shared/` like `_subscription-select.scss`.
2. In `src/app/add-subscription-form/add-subscription-form.html`, make the blank `<option value="">` of the Billing and Currency selects `disabled`. The field must still start blank and show "Billing" / "Currency" (muted, as today) on first load and after a successful add resets the form. Validation is unchanged: submitting with a blank Billing or Currency still shows the required error.

## Acceptance criteria

- [ ] The edit dialog's Price shows no spinner arrows (Chrome and Safari); typing and the number keyboard still work.
- [ ] The Billing and Currency blank options are `disabled`; the fields still start blank showing "Billing" / "Currency", and go back to blank after an add.
- [ ] Submitting with a blank Billing or Currency still shows its required error and focuses it.
- [ ] axe reports no new violations on the add form.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
