# 06: Costs and money format on cards

Status: resolved
Lane: small
Blocked by: 05
Test seam: Page seam; domain seam for costs and formatting
Spec: `.scratch/mvp/spec.md` › User Stories 29, 46; Implementation Decisions › Domain module (monthly/annual cost, money formatting), Data shape (monogram)

## What to build

Each subscription card shows its monogram (the first two characters of the name, uppercased, not stored), its price with the right currency symbol, and its **Annual cost**. Monthly cost = price, or price / 12 when yearly. Annual cost = price × 12, or price when yearly.

Money formatting uses en-US number style for every currency, with the symbols EUR €, USD $, GBP £, EGP E£. (Decided during review of this ticket: the prototype's per-currency locales are not used, so `€9.99` and `€1,234.50` read the same way for every currency.)
- Annual amounts: whole units, except that a non-zero amount that would round to zero shows 2 decimals.
- Monthly and per-subscription amounts: 2 decimals.

## Acceptance criteria

- [ ] A monthly €9.99 subscription shows a price of €9.99 per month and an annual cost of €120 (119.88 in whole units).
- [ ] A yearly $60 subscription shows a price of $60.00 per year (2 decimals) and an annual cost of $60 (whole units).
- [ ] GBP shows £ and EGP shows E£.
- [ ] A subscription named "netflix" shows the monogram "NE".
- [ ] Domain tests cover monthly/annual cost for both billing frequencies, each currency symbol, and a tiny non-zero annual amount (e.g. yearly 0.40) that does not show as zero.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
