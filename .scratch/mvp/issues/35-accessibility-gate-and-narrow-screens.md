# 35: Accessibility gate and narrow screens

Status: resolved
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

- [x] axe reports zero violations in each of the nine states.
- [x] At 375px width, everything stacks, nothing scrolls sideways, and all actions are reachable.
- [x] Every interactive element has a visible focus indicator.
- [x] Checked by hand, because axe can't: the success toast is readable before it hides, an error toast stays until the field is changed (ticket 29), and the longest duplicate-name toast fits at 320px and at 200% text size.
- [x] Checked by hand for both card dialogs (tickets 31 and 33): Tab stays inside, Escape and Close work by keyboard and touch, focus returns to the right card or ✕, and the dialog fits at 320px and 200% text size.
- [x] The look still matches the prototype on wide screens.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

Reviewer's accessibility gate, run 2026-10-09 in Chrome (Playwright) with axe-core 4.10.2 injected from cdnjs. No npm dependency was added. Rule sets: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice.

- **axe:** zero violations in all nine states. These are the empty page, one currency, several currencies, review in progress, review complete, the edit dialog with an invalid field, the delete dialog, the insight with review candidate pills, and the storage-failure notice (with IndexedDB blocked). axe left some contrast checks "incomplete": text over the page's background gradient, selects with a chevron background image, and icon-only glyphs. All are dark ink on light surfaces.
- **Focus:** tabbing through the page shows a visible focus indicator on every element. Fields use the accent border and shadow; card buttons use an `::after` outline.
- **Narrow screens:**
  - Below 560px, subscription cards now stack in one column instead of the prototype's sideways strip, as story 89 asks.
  - The top bar wraps.
  - The page's scroll width equals the viewport at 375px, at 320px, and at 320px with 200% root text.
  - Reality cards and the review and savings cards stack, and no control is clipped.
- **Checked by hand:**
  - success toast: hides after 2.5s
  - error toast: stays until the field changes (ticket 29 tests)
  - longest duplicate-name toast: wraps inside the form at 320px with 200% text
  - both card dialogs (tickets 31 and 33): Tab stays inside, and Escape and Close work by keyboard and by tap
  - focus: returns to the card button or the ✕
  - small screens: the dialog scrolls at 320px with 200% text
  - wide screens: the layout still uses the prototype's card strip and top bar
