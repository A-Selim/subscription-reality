# 48: No spinner on the edit Price; placeholder options can't be picked

Status: resolved
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

- [x] The edit dialog's Price shows no spinner arrows (Chrome and Safari); typing and the number keyboard still work.
- [x] The Billing and Currency blank options are `disabled`; the fields still start blank showing "Billing" / "Currency"; after an add Billing goes back to blank and Currency keeps the preferred currency (agreed-changes › 3).
- [x] Submitting with a blank Billing or Currency still shows its required error and focuses it.
- [x] axe reports no new violations on the add form.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

Implemented disabled Billing/Currency placeholders and a shared Price spinner reset for the add form and edit dialog. Page-seam regression assertions failed before implementation and pass afterward: disabled placeholders remain selected on initial load, and Billing returns to its selected disabled placeholder after an add. Currency keeps the Preferred currency after an add, following `docs/agreed-changes.md` §3, which wins over the checklist's wording that both fields reset blank. Existing required-error/focus tests pass for both selects.

Both TypeScript checks pass; the page spec passes 134 tests and the full suite passes 240 tests. Production build attempts exit 134 before any diagnostic (including sequential retries and worker/cache execution workarounds), so the build gate remains unticked and Status is unchanged. No project configuration was changed. Manual Chrome/Safari spinner, typing and number-keyboard checks remain; the Safari check belongs to the orchestrator. No axe runner is installed in the repo, so the add-form axe check remains unverified and unticked.

- Orchestrator (2026-10-09): build verified outside the sandbox. In the browser (Chromium), the edit Price has no spinner and keeps its full field styling, the placeholder options are disabled, Billing is blank after an add, and axe is clean on the add form and the edit dialog. Only the Safari spinner look is left for the owner.
- Owner checked Safari (2026-10-09): the edit Price shows no spinner.
