# 07: Toast and "Subscription added"

Status: ready-for-agent
Lane: small
Blocked by: 06
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Story 25; Implementation Decisions › Toast

## What to build

One toast component, used for all toasts in the app. It is a polite live region (`role="status"`), sits just above the relevant form's submit button (not in a corner), does not steal focus, and hides itself after a delay long enough to read. The first use: after a successful add, the toast says "Subscription added".

Validation toasts (ticket 10) will reuse this component.

## Acceptance criteria

- [ ] After adding a subscription, "Subscription added" appears just above the Add button.
- [ ] Focus stays where it was (the toast does not take focus).
- [ ] The toast disappears by itself after a few seconds.
- [ ] The toast container has `role="status"` (polite live region) and is present in the page before a message appears, so screen readers announce it.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
