# 02: Top bar and hero

Status: resolved
Lane: small
Blocked by: None (can start immediately)
Test seam: Page seam (render the root App with TestBed)
Spec: `.scratch/mvp/spec.md` › User Stories › Landing and empty state (1–2); Implementation Decisions › Structure

## What to build

A first-time visitor opens the app and sees the top bar and the hero from the prototype: a short message that small monthly charges add up, and a "Start adding" action in the top bar. "Start adding" is visible but does nothing yet (ticket 13 wires it). The scaffold's placeholder content and its placeholder title test are replaced.

The root App becomes the page that composes the sections in order (ADR 0001, no router). This ticket adds only the top bar and hero component.

## Acceptance criteria

- [ ] Opening the app shows the top bar and hero, matching the prototype's look.
- [ ] The top bar has a "Start adding" button.
- [ ] The scaffold placeholder (Angular logo, links, title text) is gone.
- [ ] The page has one `h1`, and the hero text is readable at AA contrast.
- [ ] The scaffold's placeholder title test is replaced by a page-seam test for the hero and "Start adding".
- [ ] `npm run build` and `npm test -- --watch=false` pass.
