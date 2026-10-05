# 24: Edit validation

Status: resolved
Lane: feature
Blocked by: 23
Test seam: Page seam; domain seam for uniqueness excluding the edited subscription
Spec: `.scratch/mvp/spec.md` › User Story 77; Implementation Decisions › Edit and delete (second and third bullets)

## What to build

The edit form uses the same validation rules as the add form (tickets 10 and 11). While any field is invalid, the last valid values stay in effect (totals don't change) and the field shows its error (`aria-invalid`, persistent `aria-describedby` text). Renaming to a name another subscription already has is refused, but keeping the subscription's own name (or changing only its case) is allowed.

If the form is invalid when Done is pressed, it stays open, the toast shows the error just above Done, and focus moves to the first invalid field.

## Acceptance criteria

- [x] Clearing the price keeps the old price in the totals and marks the price field invalid.
- [x] Pressing Done with an empty price keeps the form open, shows the toast above Done, and focuses the price field.
- [x] Renaming "Spotify" to "netflix" while "Netflix" exists is refused with the duplicate-name message.
- [x] Renaming "Netflix" to "NETFLIX" (its own name) is allowed.
- [x] Domain test: the uniqueness check excludes the subscription being edited.
- [x] `npm run build` and `npm test -- --watch=false` pass.
