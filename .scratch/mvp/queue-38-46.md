# Codex queue: tickets 38–46

Run on 2026-10-09. Codex took one ticket per run, in number order, on each ticket's `Lane:`. The orchestrator re-ran the gates, ran the two-axis code review, fixed or sent back findings, and committed.

| Ticket                               | Lane    | Status                         | Commit           |
| ------------------------------------ | ------- | ------------------------------ | ---------------- |
| 38 red invalid-field mark            | small   | resolved                       | 533e4c3          |
| 39 left-aligned toast                | small   | resolved                       | bab8bba          |
| 40 edit saves only on Done           | feature | resolved                       | 87203c5          |
| 41 backdrop click closes card dialog | small   | resolved                       | 10eef20          |
| 42 card dialog header                | small   | resolved                       | c882496, c3708ef |
| 43 select chevron spacing            | small   | resolved                       | 05b5fec          |
| 44 edit field spacing                | small   | resolved                       | 3a32961          |
| 45 cancelled not review candidates   | small   | resolved                       | 267e9c4          |
| 46 short duplicate-name message      | small   | resolved                       | bae72e5          |

## Review notes

- 38: the review set the glyph weight to 400 (agreed-changes says regular).
- 40: the unused `SubscriptionsState.restore()` was removed, and the rename test checks storage again.
- 41: a backdrop click needs both the press and the release outside the dialog box. The native `closedby="any"` was not used because Safari doesn't support it.
- 42: the other-unit cost moved under the price and into the domain helper `otherUnitCostText`. The monthly figure keeps cents. Space was added under the larger name after the browser check.
- 43: added a forced-colors fallback to the native arrow.
- 44: Codex's `:host-context` and global-style approach was replaced with a `.edit-field` wrapper per field.
- 45: one test that had lost its intent was restored, and the 120-case test grid was cut back to 30 cases plus 4 decision cases.
- The build aborts (exit 134) inside the Codex sandbox only; every build was verified outside it.

## Needs your eyes

1. **The other-unit cost shows saved values**, not the draft, so it matches the price above it. It changes after Done. Yearly billing shows cents, e.g. "€10.00 / month".
2. **Narrow add form (961–1000px):** an invalid, blank Billing select clips "Billing" under the "!" mark. To fix it, tune the column weights. Your call, per agreed-changes › 2.
3. **Safari** has not been checked (ticket 43). Chromium is fine.
4. **Tab order:** in both dialogs ✕ Close now comes first. The delete dialog still focuses Close on open; the edit dialog focuses the name field.

## End-of-run checklist

- [x] Full `npm test -- --watch=false` and `npm run build` on the final tree.
- [x] Owner: Safari look of the dropdowns (ticket 43).
- [ ] Owner: decide on point 2 above.
