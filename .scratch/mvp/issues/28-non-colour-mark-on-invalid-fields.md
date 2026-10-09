# 28: A mark that is not colour on invalid fields

Status: resolved
Lane: small
Blocked by: 27
Test seam: Page seam (the mark is present on an invalid field, absent on a valid one)
Spec: AGENTS.md › Accessibility Requirements (WCAG AA); WCAG 1.4.1 Use of Color

## What to build

Today an invalid field in the add form and in the edit form is marked only by a red border. In the edit form the red shows while the user types, but the error text shows only when Done is pressed (an agreed behaviour), so in between the error is shown by colour alone. That fails WCAG 1.4.1.

Add a visual mark that does not depend on colour to every invalid field in both forms, for example a "!" icon in the field or a clearly thicker border. Put it in the shared field-and-error component from ticket 27, so both forms get it from one place. The mark is decorative for screen readers (they already get `aria-invalid` and the error text), and it keeps AA contrast (3:1 for non-text marks) on the dark card.

The behaviour stays the same: the edit form still shows its error text only in the toast when Done is pressed, and the add form still shows it on submit.

## Acceptance criteria

- [x] An invalid field shows the mark in both forms; a valid field doesn't.
- [x] The mark is still recognisable in greyscale (not a colour change only).
- [x] The mark is hidden from screen readers and adds no new announcement.
- [x] The mark has at least 3:1 contrast against its background.
- [x] The field layout doesn't shift or overflow at 375px width.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

- The mark is a dark round "!" badge (`--ink` with a white glyph, about 17:1) inside the control's end edge. The fields are white in both forms, not the dark card. Checked in a browser at 1280px and 375px for the add form, and at 375px for the edit form, which shows the mark while typing before Done. No horizontal scroll, and select chevrons stay visible.
