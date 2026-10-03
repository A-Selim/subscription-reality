# 13: "Start adding" action

Status: resolved
Lane: small
Blocked by: 12
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Story 2; Implementation Decisions › Add form (last-but-one bullet)

## What to build

"Start adding" in the top bar scrolls to _Your recurring life_, reveals the add form if it's still hidden (empty state), then focuses the name field. The scroll respects `prefers-reduced-motion`.

jsdom has no `Element.scrollIntoView` or `window.matchMedia`. Stub both in the test setup (shared, not per spec) so page tests can run; assert focus, not scrolling.

## Acceptance criteria

- [x] On an empty page, "Start adding" shows the add form and focuses the name field.
- [x] With subscriptions present, "Start adding" focuses the name field of the visible add form.
- [x] By hand in the browser: with reduced motion turned on in the OS, the jump happens without smooth scrolling.
- [x] `npm run build` and `npm test -- --watch=false` pass.
