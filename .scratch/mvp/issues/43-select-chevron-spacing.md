# 43: Space between the select chevron and the border

Status: ready-for-human
Lane: small
Blocked by: 38
Test seam: Manual visual check (Chrome and Safari, add form and edit dialog)
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 2 (custom chevron).

## What to build

- The edit dialog's selects use the browser's native arrow (no `appearance` reset), which sits right against the border. Give them the same reset and custom chevron as the add form. Share the style rather than copying it if that stays simple.
- Move the chevron a little further from the right edge in both forms (e.g. `right 15px` → `right 18px`), and widen the select end padding to match.
- Keep the invalid "!" mark (ticket 38) clear of the moved chevron.

## Acceptance criteria

- [x] Every select in both forms shows the custom chevron with visible space from the border.
- [x] An invalid select's "!" mark doesn't overlap the chevron, and the selected text doesn't run under either.
- [ ] Looks right in Chrome and Safari.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

Shared select styling now gives the add form and edit dialog the same custom chevron and spacing. The invalid select marker and end padding were retuned to keep a visible gap. Chrome and Safari still need a manual visual check.

- Orchestrator: added a forced-colors fallback to the native arrow. Status is ready-for-human until the browser check, which must include the add form just above 960px, where an invalid blank Billing or Currency select is narrowest.
