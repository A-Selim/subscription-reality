# 35: Accessibility gate and narrow screens

Status: ready-for-agent
Lane: small
Blocked by: 34
Test seam: Manual (axe in the browser, narrow viewport). The reviewer runs axe; the agent fixes what it reports.
Spec: `.scratch/mvp/spec.md` › User Stories 89–91; Testing Decisions (last bullet)

## What to build

A final sweep. Run axe in the browser (DevTools or the axe extension, no new npm dependency) and fix every violation, including contrast. Check the page at phone width: subscription cards, reality cards, and the review and savings cards stack with no horizontal scroll.

States to check with axe:
1. empty page
2. one currency
3. several currencies
4. review in progress
5. review complete
6. edit dialog open with an invalid field
7. delete dialog open
8. insight with review candidates (pills, ticket 34)
9. storage-failure notice showing

## Acceptance criteria

- [ ] axe reports zero violations in each of the nine states.
- [ ] At 375px width, everything stacks, nothing scrolls sideways, and all actions are reachable.
- [ ] Every interactive element has a visible focus indicator.
- [ ] Checked by hand, because axe can't: the success toast is readable before it hides, an error toast stays until the field is changed (ticket 29), and the longest duplicate-name toast fits at 320px and at 200% text size.
- [ ] Checked by hand for both card dialogs (tickets 31 and 33): Tab stays inside, Escape and Close work by keyboard and touch, focus returns to the right card or ✕, and the dialog fits at 320px and 200% text size.
- [ ] The look still matches the prototype on wide screens.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
