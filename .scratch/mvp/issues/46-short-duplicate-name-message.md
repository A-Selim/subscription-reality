# 46: Short duplicate-name message

Status: ready-for-agent
Lane: small
Blocked by: none
Test seam: Page seam (add and rename)
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 2; spec story 19 and validation decisions.

## What to build

In `shared/subscription-form-schema.ts`, change the duplicate-name message to **"You already have {existing name}."** Drop the "Add something to tell them apart, like '… Family'." part. It applies when adding and when renaming in the edit dialog.

## Acceptance criteria

- [ ] Adding "netflix " when "Netflix" exists shows "You already have Netflix."
- [ ] Renaming another subscription to "Netflix" shows the same message.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
