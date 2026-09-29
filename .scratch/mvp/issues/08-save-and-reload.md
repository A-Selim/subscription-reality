# 08: Save and reload

Status: resolved
Lane: feature
Blocked by: 07
Test seam: Storage seam (in-memory fake, reload by re-creating the App on the same fake); IndexedDB adapter checked by hand in the browser
Spec: `.scratch/mvp/spec.md` › User Stories 8, 86–87; Implementation Decisions › State service (saving and loading), Storage port

## What to build

Subscriptions survive a refresh, a browser restart and reopening the app. The data stays on the device.

- A storage port: an abstract class with `load(): Promise<AppState | null>` and `save(state: AppState): Promise<void>`, used directly as the injection token.
- The production adapter uses IndexedDB: one database, one object store, the whole `AppState` (with `version: 1`) under one key. It validates the loaded shape and version. Absent data means a first visit. (Handling of unreadable data is ticket 09; for now treat it as a first visit.)
- An in-memory fake for tests. It stores a deep copy of each save, can hold a save pending until the test releases it, and can be told to reject loads or saves. From now on all page tests provide this fake.
- The state service loads before the sections render, so returning users never see the empty state flash. Every change saves the whole state. Saves run one at a time, and pending saves may be merged into the latest state, so an older save never lands after a newer one.

No new dependencies.

## Acceptance criteria

- [x] In the browser: add two subscriptions, refresh, and both are still there in the same order. Close and reopen the browser: still there.
- [x] A returning visit shows the saved cards straight away, with no flash of the empty state.
- [x] Storage test: add subscriptions, destroy the fixture, create a new App on the same fake, and the subscriptions come back.
- [x] Storage test: several quick adds with the first save held pending. After releasing and settling, a reload shows the final state.
- [x] No request leaves the browser (no backend).
- [x] One shared test helper renders the App on a given in-memory fake and waits for the load. Later tickets reuse it.
- [x] All existing page specs (from tickets 02–07) use that helper and pass.
- [x] `npm run build` and `npm test -- --watch=false` pass.
