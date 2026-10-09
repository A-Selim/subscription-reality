# 25: Fix the Prettier drift

Status: ready-for-agent
Lane: small
Blocked by: 24
Test seam: None (formatting only); the existing tests must still pass
Spec: Follow-up from the ticket 21–24 reviews

## What to build

Two files fail `npx prettier --check` since before ticket 21: `src/app/app.spec.ts` and `src/app/add-subscription-form/add-subscription-form.scss`. Format them with Prettier so that later tickets show only real changes in their diffs. Nothing changes in behaviour, tests or styles.

## Acceptance criteria

- [ ] `npx prettier --check src/app` reports no files.
- [ ] The diff is formatting only: no test, selector or value changes.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
