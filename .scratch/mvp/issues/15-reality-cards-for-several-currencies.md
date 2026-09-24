# 15: Reality cards for several currencies

Status: ready-for-agent
Lane: feature
Blocked by: 14
Test seam: Page seam; domain seam for per-currency grouping and first-used ordering
Spec: `.scratch/mvp/spec.md` › User Stories 36–38; Implementation Decisions › Reality section (second bullet); Further Notes 4

## What to build

Currencies are never added together. _See the reality_ shows one reality card per currency, stacked full-width. Cards are in first-used order among **current** subscriptions (the lowest `sequence` in each currency). Each card counts only its own currency's subscriptions and rarely used ones.

Deleting is not built yet. The domain function must still drop a currency with no subscriptions and put a re-used currency at the end, and domain tests cover that.

## Acceptance criteria

- [ ] Add EUR, then USD, then EUR again: two cards, EUR first, then USD, each with its own totals and counts.
- [ ] With one currency, exactly one card shows, as in ticket 14.
- [ ] Cards stack full-width, also on a narrow screen.
- [ ] Domain tests: grouping per currency; order by first use; a currency with no subscriptions has no entry; a currency re-used after all its subscriptions were removed goes to the end.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
