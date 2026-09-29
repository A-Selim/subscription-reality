# 07b: Compact add form

Status: resolved
Lane: small
Blocked by: 07
Test seam: Page seam
Spec: `.scratch/mvp/spec.md` › Implementation Decisions › Add form (layout); `docs/agreed-changes.md` §2 (Layout: a compact form)

## What to build

Restyle the add form so it feels small and quick to fill, like the prototype (`docs/prototype/index.html`: `.add-inline`, `.form-grid`, `.field`, `.helper`). Nothing about what the form does changes. This is layout, copy and labels only.

- **One row on wide screens:** name, price, billing frequency, currency, reason. Two columns under 960px (not the prototype's 820px, so select text isn't clipped), one column under 560px. The form keeps its current width (no 760px cap). Use the prototype's column weights (`1.4fr .7fr .7fr .75fr 1fr`) as the starting point and adjust only if something clips.
- **Prototype field style:** 16px radius, about 10px gap, compact padding, no big heading. Keep a clearly visible focus ring (2px `--accent` outline is fine; a soft ring alone is not enough). **Exception to the prototype:** the field border is `#8a8a84` (about 3.5:1 on white, WCAG 1.4.11), not the faint `--line`, because the border is the only cue for a field's edge once labels are hidden. A select showing its blank option ("Billing", "Currency") uses the muted text colour like the placeholders (class bound to the form model, not `:invalid`).
- **Labels stay, hidden.** Each control keeps its real `<label>` (same `for`/`id` as today) but visually hidden (a shared visually-hidden utility class, not `display:none`). The heading "Add a subscription" is also visually hidden and still names the form (`aria-labelledby`).
- **Placeholders:** name `Name e.g. Spotify`, price `Price`. They show whenever the field is empty, including after the user erases it. They must meet AA contrast.
- **Blank select options:** billing `Billing`, currency `Currency`. Values stay blank (`''`), and the fields stay required and blank by default as agreed. The billing label (hidden) still reads "Billing frequency".
- **Reason names are not renamed** for layout ("Work / Learning" is a domain term and a stored value). If a long Reason (for example "Work / Learning", "Occasional Use") is clipped in the row, do NOT change it yourself: adjust column weights within reason, then report it with a screenshot so the owner decides. Do not add display-label mappings without asking.
- **Submit button** text is `Add subscription` (was `Add`). Keep the toast directly above it (ticket 07) and the muted, centred usage helper line below it.

Update the existing page tests for the new button text and blank-option text. Fields are still found by `id`/label.

## Acceptance criteria

- [ ] On a wide screen the five fields sit in one row; under 960px they use two columns; under 560px one column (check by hand in the browser at each width, or by asserting the grid CSS).
- [ ] Browser check, reported with screenshots: the form at 1,120px, 960px, 800px and 375px wide, and at 200% zoom. Note any clipped select text (with a Reason like "Work / Learning" selected), so the owner can decide what to do.
- [ ] No label or heading text is visible, but each control still has an accessible name: "Subscription name", "Price", "Billing frequency", "Currency", "Reason" (page tests assert label text and that the form has the accessible name "Add a subscription").
- [ ] Name and price show their placeholders when empty, including after the user types and then erases the value.
- [ ] The blank billing and currency options read "Billing" and "Currency", are not clipped, and still submit as blank. The billing control's accessible name is still "Billing frequency".
- [ ] The submit button is named "Add subscription"; the toast still sits directly above it.
- [ ] The five fields and the submit button are all 45px tall at normal text size (one shared `--control-height`, used as `min-height`, not a fixed `height`), at every breakpoint, with no clipped text.
- [ ] Focus rings are clearly visible on every field and the button; placeholder and helper text meet WCAG AA contrast, and the field border meets 3:1 (`#8a8a84`).
- [ ] Adding a subscription behaves exactly as before (reset, name refocus, toast, preferred currency).
- [ ] `npm run build` and `npm test -- --watch=false` pass.
