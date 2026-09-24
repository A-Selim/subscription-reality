# 11: Duplicate name check

Status: ready-for-agent
Lane: small
Blocked by: 10
Test seam: Page seam; domain seam for name normalization and uniqueness
Spec: `.scratch/mvp/spec.md` › User Story 19; Implementation Decisions › Add form (duplicate-name copy), Domain module (name normalization and uniqueness); Further Notes 8

## What to build

A **Subscription** name is unique, ignoring case and surrounding spaces. Adding a name that already exists is refused with the validation behaviour from ticket 10 and this message, using the existing subscription's name in both places:

> You already have Netflix. Add something to tell them apart, like 'Netflix Family'.

The uniqueness check takes an optional subscription to exclude, so editing (ticket 24) can reuse it.

## Acceptance criteria

- [ ] With "Netflix" in the list, adding " netflix " is refused, the name field gets focus, and the toast shows the message above with "Netflix" in both places.
- [ ] Adding "Netflix Family" works.
- [ ] Domain tests cover case differences, surrounding spaces, and excluding a given subscription from the check.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
