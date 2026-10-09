# 46: Short duplicate-name message

Status: resolved
Lane: small
Blocked by: none
Test seam: Page seam (add and rename)
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 2; spec story 19 and validation decisions.

## What to build

In `shared/subscription-form-schema.ts`, change the duplicate-name message to **"You already have {existing name}."** Drop the "Add something to tell them apart, like '… Family'." part. It applies when adding and when renaming in the edit dialog.

## Acceptance criteria

- [x] Adding "netflix " when "Netflix" exists shows "You already have Netflix."
- [x] Renaming another subscription to "Netflix" shows the same message.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

Shortened the shared duplicate-name validation message, with page-seam coverage for adding and renaming. All automated checks pass.
