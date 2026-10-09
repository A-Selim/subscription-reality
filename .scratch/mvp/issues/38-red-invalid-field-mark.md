# 38: Red invalid-field mark at the end of the field

Status: ready-for-agent
Lane: small
Blocked by: none
Test seam: Page seam (mark present on invalid field, absent on valid); manual visual check at 1280px and 375px
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 2 (Validation errors). Changes the look from ticket 28.

## What to build

The "!" mark from ticket 28 (in `shared/subscription-field.ts`) looks heavy. Make it simpler:

- A red circle (`--red`) with a white "!" in a lighter weight (e.g. 600 instead of 900).
- On text inputs (Name, Price) it sits at the end of the field (about 12px from the right edge), not 36px in. Inputs then need less end padding while invalid.
- On selects it stays just before the chevron, so the two never overlap. Coordinate with ticket 43, which moves the chevron.

Applies to both forms (add form and edit dialog).

## Acceptance criteria

- [ ] An invalid Name or Price shows a red round "!" near the field's right edge, in both forms.
- [ ] On an invalid select, the mark sits before the chevron with no overlap.
- [ ] Typed text never runs under the mark.
- [ ] The mark stays `aria-hidden` and has at least 3:1 contrast against the white field (white on `--red` is about 5.7:1).
- [ ] No layout shift or overflow at 375px.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
