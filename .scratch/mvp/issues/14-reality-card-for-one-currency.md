# 14: Reality card for one currency

Status: resolved
Lane: feature
Blocked by: 13
Test seam: Page seam; domain seam for recurring cost and rarely used
Spec: `.scratch/mvp/spec.md` › User Stories 28, 37, 39–42, 45; Implementation Decisions › Reality section, Add form (last bullet: focus after the first add)

## What to build

Once a subscription exists, _See the reality_ is no longer dimmed and shows one reality card that looks like the prototype:
- label
- annual **Recurring cost** (the biggest number on the card)
- monthly recurring cost ("every month", 2 decimals)
- number of subscriptions
- number of **Rarely used** subscriptions (usage Rarely or Almost Never)

Totals update immediately after each add. This ticket may assume a single currency; ticket 15 handles several. The before/after comparison is ticket 20.

When the **first** subscription is added, the page smoothly scrolls to _See the reality_ and, once the section has rendered, moves focus to its heading (`tabindex="-1"`), because the Add button the user activated disappears with the empty state. The scroll respects `prefers-reduced-motion`. Later adds keep focus in the add form's name field.

jsdom has no `Element.scrollIntoView` or `window.matchMedia`. Stub both in the test setup (shared, not per spec) so page tests can run; assert focus, not scrolling.

## Acceptance criteria

- [x] Add a monthly €10 and a yearly €60: the card shows €180 per year, €15.00 every month, 2 subscriptions.
- [x] Add one with reason Occasional Use: the rarely used count goes up by one.
- [x] After the first add, the page scrolls to _See the reality_ and focus is on its heading.
- [x] After a second add, focus is in the name field.
- [x] By hand in the browser: with reduced motion turned on in the OS, the first add jumps without smooth scrolling.
- [x] Domain tests cover recurring cost (monthly and annual) and the rarely used count.
- [x] `npm run build` and `npm test -- --watch=false` pass.
