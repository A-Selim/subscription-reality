# 26: Shared form rules and billing options

Status: ready-for-agent
Lane: small
Blocked by: 25
Test seam: Page seam (existing add and edit tests stay green, unchanged)
Spec: Follow-up from the ticket 21–24 reviews; AGENTS.md › Workflow Rules (folder structure)

## What to build

A mechanical cleanup before more edit-form work. Nothing the user sees changes.

- **Shared form rules in a neutral place.** The validation schema and its helpers (first invalid field, error text per field) are used by both the add form and the edit form on the subscription card, but they live inside the add form's folder. Move them to a neutral place that both forms import from.
- **Rename `NewSubscription` to `SubscriptionDetails`.** The type holds the five fields the user enters (name, price, billing frequency, currency, reason), and editing uses it too, so "New" is misleading. Rename only; no behaviour change.
- **Billing frequency options from the domain list.** Both forms hard-code the Monthly and Yearly options. Build them from the domain's existing billing-frequency list, as the currency and reason options already are. The add form keeps its blank "Billing" placeholder option.

## Acceptance criteria

- [ ] No file outside the add form imports the form rules from the add form's folder.
- [ ] Neither template hard-codes the Monthly or Yearly option; the option labels stay "Monthly" and "Yearly".
- [ ] No `NewSubscription` is left in the code; `SubscriptionDetails` is used for both add and edit.
- [ ] The existing add and edit tests pass without edits.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
