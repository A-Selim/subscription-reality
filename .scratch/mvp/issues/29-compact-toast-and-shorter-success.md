# 29: Compact toast and shorter success confirmation

Status: resolved
Lane: small
Blocked by: 28
Test seam: Page seam (toast width class/style, hide timing with fake timers, error stays until the field changes)
Spec: Owner note (2026-10-09): "toasts for the main form need to be smaller, have the max width of mobile, and show for less time"; `docs/agreed-changes.md` › 2 (validation toast); `.scratch/mvp/spec.md` › Toast; WCAG 2.2.1 Timing Adjustable

## What to build

The toast above the submit button is smaller and success confirmations go away sooner. The toast is one shared component, so the add form and the edit form both get this (the edit form moves into the card dialog in ticket 33; the toast rules stay); the component is not forked.

- **Size:** the toast is centred above the submit button and at most 360px wide, including its padding and border. On narrower screens it fills the available width with no overflow. Padding and font stay as today.
- **Success** ("Subscription added"): hides after 2.5 seconds (today 4 seconds).
- **Errors:** no longer hide on a timer. An error toast stays until the user changes the field it reports (any change, valid or not), or another toast replaces it. A timer alone doesn't satisfy WCAG 2.2.1, because the sighted user's only visible explanation would disappear. The field keeps its red mark and its `aria-describedby` error text while it is still invalid.

Update the toast wording in `docs/agreed-changes.md` › 2 and in `.scratch/mvp/spec.md` › Toast to match.

## Acceptance criteria

- [ ] In both forms the toast is centred above the submit button and never wider than 360px; at 320px width it doesn't overflow. (Width and 320px are met; "centred above the button" is open for the owner, see Comments.)
- [x] "Subscription added" hides after 2.5 seconds.
- [x] An add-form error toast is still showing after 10 seconds, and hides as soon as the user changes the reported field.
- [x] An edit-form Done error toast behaves the same way.
- [x] A new toast replaces the current one, including while it is fading; no timer is left running after the form is destroyed.
- [x] `role="status"`, repeated-message announcements, the field's `aria-describedby` error text and focus behaviour don't change.
- [x] `docs/agreed-changes.md` › 2 and the spec's Toast section describe the new timing.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

- Open for the owner: at desktop width the toast (at most 360px) is centred in the form, while the Add subscription button is left-aligned, so the toast doesn't sit right over the button. If it should line up with the button instead, change `justify-self` in `toast.scss`.
