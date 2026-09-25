# 05: Add a subscription to the list

Status: resolved
Lane: feature
Blocked by: 04
Test seam: Page seam; domain seam for the estimated-usage table
Spec: `.scratch/mvp/spec.md` › User Stories 9–10, 12–13, 16, 26–27, 29–33; Implementation Decisions › Domain module, Data shape, State service (intent method `add` only), Add form

## What to build

The first tracer bullet through all layers, in memory only (no storage yet).

"Add your first subscription" reveals the add form. The form has name, price, **Billing frequency**, currency (EUR, USD, GBP, EGP) and **Reason**, and no usage field. Reason starts on _Essential_. Billing frequency and currency start blank. A small, centred, muted note at the bottom says usage is estimated from the reason and can be refined in the review. Build the form with Signal Forms so the same model can be reused for editing later.

Adding creates a **Subscription** with **Usage** estimated from the reason (Essential, High Value, Work / Learning → Daily; Convenience → Weekly; Nice to Have → Monthly; Occasional Use → Rarely; never Almost Never), `usageConfirmed: false` and `decision: null`. It appears as a card showing name, price with its billing frequency, reason and usage. Cards are in the order they were added. After an add, name, price and billing frequency clear. Reason stays _Essential_ and currency stays as chosen. Once there are subscriptions, the empty state is replaced by the card list with the add form under it.

This ticket introduces:
- the pure domain module (types from the spec's data shape, estimated usage),
- the singleton state service (signals, `add` intent),
- the recurring-life section's card list and add form.

It does **not** include validation (10), toasts (07), costs or money formatting (06), or persistence (08). With incomplete input, Add simply adds nothing.

## Acceptance criteria

- [ ] Clicking "Add your first subscription" shows the add form, with reason on _Essential_ and billing frequency and currency blank.
- [ ] The form has no usage field and shows the muted estimate note at the bottom.
- [ ] Filling all fields and pressing Add shows a card with name, price and billing frequency, reason and estimated usage.
- [ ] Choosing Occasional Use shows usage Rarely; Convenience shows Weekly; Nice to Have shows Monthly; Essential shows Daily.
- [ ] After an add, name, price and billing frequency are blank again; reason is _Essential_.
- [ ] A second subscription appears after the first; the add form stays visible under the cards.
- [ ] Domain tests cover every row of the estimated-usage table and confirm Almost Never is never estimated.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
