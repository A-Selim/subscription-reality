# 43: Space between the select chevron and the border

Status: ready-for-agent
Lane: small
Blocked by: 38
Test seam: Manual visual check (Chrome and Safari, add form and edit dialog)
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 2 (custom chevron).

## What to build

- The edit dialog's selects use the browser's native arrow (no `appearance` reset), which sits right against the border. Give them the same reset and custom chevron as the add form. Share the style rather than copying it if that stays simple.
- Move the chevron a little further from the right edge in both forms (e.g. `right 15px` → `right 18px`), and widen the select end padding to match.
- Keep the invalid "!" mark (ticket 38) clear of the moved chevron.

## Acceptance criteria

- [ ] Every select in both forms shows the custom chevron with visible space from the border.
- [ ] An invalid select's "!" mark doesn't overlap the chevron, and the selected text doesn't run under either.
- [ ] Looks right in Chrome and Safari.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
