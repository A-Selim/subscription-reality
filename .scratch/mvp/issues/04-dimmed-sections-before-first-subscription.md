# 04: Dimmed sections before the first subscription

Status: ready-for-agent
Lane: feature
Blocked by: 03
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Stories 6–7, 61, 73; Implementation Decisions › Reality section (first bullet), Savings card, Further Notes 5

## What to build

Before any subscription exists, the visitor sees what is coming: the _See the reality_ section, the review card and the savings card (side by side, stacked on narrow screens) are shown dimmed. They contain no buttons or other controls. Their explanatory text stays readable:

- reality: "Add a subscription first" and zero figures
- review: says the review starts once a subscription is added
- savings: a single neutral zero and the insight "Add your subscriptions first. Your review insights will appear here."

The dimmed look must meet WCAG AA contrast, so it cannot copy the prototype's opacity-based locked look. The sections are **not** `inert`, so screen readers can still read them.

These are the section components later tickets fill in; for now they only render their empty state.

## Acceptance criteria

- [ ] With no subscriptions, the three areas are visibly dimmed and contain no focusable elements (tabbing skips them).
- [ ] Their text is present in the accessibility tree (no `inert`, no `aria-hidden` on the text).
- [ ] The dimmed text meets AA contrast (4.5:1 for body text) when checked in DevTools.
- [ ] The review and savings cards sit side by side on wide screens and stack on narrow screens.
- [ ] Page tests assert the placeholder copy and that no button exists inside the dimmed areas.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
