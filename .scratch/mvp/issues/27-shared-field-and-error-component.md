# 27: Shared field-and-error component

Status: resolved
Lane: feature
Blocked by: 26
Test seam: Page seam (existing add and edit tests stay green, unchanged)
Spec: Follow-up from the ticket 21–24 reviews; AGENTS.md › Components, Accessibility Requirements

## What to build

A cleanup before more edit-form work (tickets 28 to 33). Nothing the user sees changes.

Today the add form and the edit form on the subscription card repeat, for every validated field, the same markup: a label, the control, `aria-invalid`, `aria-describedby`, and the hidden error text with its id. Make one small component that both forms use for this.

- It wraps the control the form gives it; the form keeps its Signal Forms binding on the control.
- It supports a visually hidden label (the add form) and a visible label (the edit form).
- It builds unique ids, because the edit form appears once per subscription card.
- It takes the field's error text (from the shared form rules, ticket 26) and owns the `aria-invalid` / `aria-describedby` wiring.

## Acceptance criteria

- [x] Both forms render every validated field through the shared component; no form repeats the `aria-invalid` / `aria-describedby` / error-text markup.
- [x] Every control still has a real `<label>` linked to it, and its error text is still linked through `aria-describedby` only while the field is invalid.
- [x] Two open edit forms never share an id.
- [x] The existing add and edit tests pass without edits.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

- The page only allows one open edit form at a time, so "two open edit forms never share an id" holds by construction: every `SubscriptionField` gets its id from a module-level counter. The page test covers the add form and an edit form open together, and switching which card is edited.
