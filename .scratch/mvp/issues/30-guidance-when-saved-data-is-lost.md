# 30: Guidance when saved data can't be loaded

Status: needs-info
Blocked by: 09
Spec: `docs/agreed-changes.md` › Storage; research in `docs/research/browser-storage.md`

## Why

The owner's idea (2026-09-30): when the app can't load the saved data, the storage notice should tell the user what to do next, for example to add their subscriptions again, not only what went wrong. Today the notices only explain what happened.

## Open questions (investigate and discuss before building)

- Which cases should ask the user to add their subscriptions again?
  - The load failed. The data may still be there, so a reload might bring it back.
  - The data is unreadable, with or without a backup copy.
  - The backup copy failed.
- Should the notice suggest reloading the page first, before re-adding?
- If the user re-adds subscriptions and the old data comes back later, what happens? This connects to ticket 29 (import, merge or replace).
- Should the notice include an action, for example a button that focuses the add form, or stay text only?
- What copy works for each case, and does it stay calm and short?
- Note: data that the browser or the user cleared can't be detected. It looks like a first visit, so no notice can show for it.

## What to build

To be written after the discussion. Then set `Status: ready-for-agent` and add a `Lane:` line.
