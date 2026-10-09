# 47: Add form columns fit their text next to the invalid mark

Status: ready-for-agent
Lane: small
Blocked by: none
Test seam: Manual (browser measurement at 961–1300px in the invalid state); existing tests must pass
Spec: Owner decision (2026-10-09): "fix narrow add form by decreasing subscription name form field". `docs/agreed-changes.md` › 2 (Layout).

## Why

On the one-row add form, from 961px up to about 1100px, the invalid "!" mark (ticket 38) and the wider chevron padding (ticket 43) leave too little room in the narrow columns. A blank, invalid Billing select shows "Billin…", Currency shows "Curren…", and Reason can clip "Work / Learning". The orchestrator measured it in the browser: narrowing Name alone is not enough at 961px.

## What to build

In `src/app/add-subscription-form/add-subscription-form.scss`:

- One-row column weights: `1.1fr 0.85fr 0.85fr 0.88fr 1.02fr` (was `1.4fr 0.7fr 0.7fr 0.75fr 1fr`), keeping `minmax(0, …)`.
- Two-column breakpoint: `max-width: 980px` (was 960px). The one-column breakpoint stays at 560px.

Nothing else changes.

## Acceptance criteria

- [ ] From 981px up, with every field invalid, "Name e.g. Spotify", "Billing", "Monthly", "Currency" and "Work / Learning" are not clipped by the mark, the chevron or the field edge.
- [ ] At 980px and below the form uses two columns, and under 560px one column, with no horizontal scroll.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
