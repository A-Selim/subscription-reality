# 03: Empty _Your recurring life_ section

Status: ready-for-agent
Lane: small
Blocked by: 02
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › User Stories 3–5; Implementation Decisions › Structure

## What to build

Below the hero, a first-time visitor sees the _Your recurring life_ section in its empty state, as in the prototype. It asks "What are you paying for every month?", shows the example categories (Streaming, AI tools, Cloud storage, Gym, News, Software), and offers one primary action: "Add your first subscription". The button does not reveal a form yet (ticket 05 does that).

## Acceptance criteria

- [ ] The section heading _Your recurring life_ and the question "What are you paying for every month?" are shown.
- [ ] The six example categories are shown.
- [ ] There is exactly one primary action, "Add your first subscription", and it is a keyboard-operable button.
- [ ] The look matches the prototype's empty state.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
