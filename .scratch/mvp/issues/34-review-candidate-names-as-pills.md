# 34: Review candidate names as pills

Status: resolved
Lane: small
Blocked by: 33
Test seam: Page seam (pills render as separate buttons, no separators, selection still works)
Spec: Owner decision (2026-10-09): the review candidate names on the savings card "have to pop up, with a border with round corners and a larger font"; design approved with name only. Changes `docs/agreed-changes.md` › 9 ("one muted line of names") and spec stories 70–71.

## What to build

Today the **Review candidate** names under the insight sentence are one muted line of text buttons ("Adobe · Headspace · Audible"). They now stand out as pills, so the user acts on them.

- Each name is its own pill button showing the name only: a rounded border with fully round ends, 16px text, padding about 6px 12px, in a row that wraps, with gaps between pills. The " · " separators go away.
- Text contrast is at least 4.5:1, and the border and focus indicator at least 3:1, against the dark insight box. Pick the exact colours to meet this.
- Hover and focus-visible states are distinct. Targets are at least 24px high; aim for 44px.
- Long names (up to 40 characters) wrap inside the pill at 320px width and at 200% text size.
- Nothing else changes: which subscriptions are candidates, the amounts sentence, the placeholder texts, keyboard activation and the move of focus to the review heading (ticket 22).

Update `docs/agreed-changes.md` › 9 and spec stories 70–71.

## Acceptance criteria

- [x] Each review candidate shows as its own pill button with its name only; there are no " · " separators.
- [x] Selecting a pill brings that subscription up in the review and moves focus to the review heading, as before.
- [x] Text has at least 4.5:1 contrast; the pill border and the focus indicator have at least 3:1.
- [x] Pills wrap with no horizontal scroll at 320px width and at 200% text size, including a 40-character name.
- [x] The tests that checked the " · " separator now check separate pills.
- [x] `docs/agreed-changes.md` › 9 and spec stories 70–71 describe the pills.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

- Pills are a labelled list ("Review candidates") of buttons with a 36px minimum height. That meets the 24px minimum; 44px was only an aim, and 36px keeps the insight box compact. Contrast: text 13.4:1 / 7.9:1, border 8.8:1 / 5.2:1, white focus outline, on the active (#272727) and inactive (#4b4b46) insight boxes. Checked in Chrome: a 40-character name wraps inside its pill at 320px with 200% text.
