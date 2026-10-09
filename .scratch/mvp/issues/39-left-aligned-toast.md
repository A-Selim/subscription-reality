# 39: Toast aligned left above the submit button

Status: ready-for-human
Lane: small
Blocked by: none
Test seam: Manual visual check (add form and edit dialog, 1280px and 320px)
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 2; spec › toast. Settles ticket 29's open "centred" box.

## What to build

The toast is centred today (`justify-self: center` in `toast/toast.scss`). Align it with the left edge of the button below it: above **Add subscription** in the add form and above **Done** in the edit dialog. Width rules stay: at most 360px, full width on narrow screens.

## Acceptance criteria

- [ ] In the add form, error and success toasts start at the left edge of the Add subscription button.
- [ ] In the edit dialog, the error toast starts at the left edge of Done.
- [ ] Still at most 360px wide; no overflow at 320px.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

- Once done, tick ticket 29's open box with a pointer here.
- Updated the shared toast alignment to start-align it with its action button. Manual browser checks at 1280px and 320px remain because the development server cannot bind to the sandbox's loopback port.
- Orchestrator: Status is ready-for-human until the browser check. Ticket 29's box gets ticked after that check.
