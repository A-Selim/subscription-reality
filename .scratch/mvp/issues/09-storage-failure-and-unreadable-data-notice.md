# 09: Storage failure and unreadable data notice

Status: resolved
Lane: feature
Blocked by: 08
Test seam: Storage seam (fake told to reject loads/saves, or seeded with unreadable data)
Spec: `.scratch/mvp/spec.md` › User Story 88; Implementation Decisions › State service (last bullet), Storage port (unreadable data); Further Notes 12–13

## What to build

If the browser blocks or fails storage, the app keeps working in memory for the current visit. It logs a warning and shows a calm, persistent notice (a polite live region) saying that changes will only last for this visit. The notice stays until a later save succeeds.

If data is present but unreadable (wrong shape or version), it is never overwritten silently. The adapter copies it to a backup key, the app starts empty, and the notice explains that saved data couldn't be read.

### How "unreadable" reaches the app (fills a gap in the spec)

`load()` returning `null` already means "first visit", so unreadable data needs its own signal:
- When the IndexedDB adapter finds data with the wrong shape or version, it first copies the raw value to a backup key in the same object store. Then `load()` rejects with a distinct `UnreadableStateError`.
- The state service treats `UnreadableStateError` as "start empty, show the couldn't-be-read notice", and any other rejection as "start empty, show the only-for-this-visit notice".
- The in-memory fake can be told to reject `load()` with `UnreadableStateError`. The backup copy lives only in the IndexedDB adapter and is checked by hand in the browser.

### Two notices (decided 2026-09-30, see `docs/agreed-changes.md` › Storage)

The two notices are separate facts, so they can show together:
- _Couldn't be read_: set by an unreadable load. It stays for the whole visit; no save clears it.
- _Only for this visit_: set by any other failed load or by a failed save. It goes away when a later save succeeds.

Saving is never blocked after a failed load. The one exception stays: if the unreadable data can't be copied to the backup key, saves stop for that visit.

### Ask the browser to keep the data

After the first successful save of a visit, the IndexedDB adapter calls `navigator.storage.persist()` once, unless `navigator.storage.persisted()` already says yes. It never calls it on page load, because Firefox shows a permission prompt. If the API is missing, refuses or throws, nothing changes and no notice shows. Research: `docs/research/browser-storage.md`.

## Acceptance criteria

- [x] With a failing load, the page renders the empty state, adding still works, and the notice says changes only last for this visit.
- [x] With a failing save, the added subscription still shows, and the notice appears.
- [x] After a failing save, a later successful save removes the notice.
- [x] With the fake rejecting `load()` with `UnreadableStateError`, the page starts empty and the notice explains the saved data couldn't be read.
- [x] By hand in the browser: write a malformed value under the state key in DevTools and reload. The page starts empty with the notice, and the malformed value is still there under the backup key.
- [x] With an unreadable load, then a failing save, both messages show. After a later successful save, only the couldn't-be-read message stays.
- [x] The notice is a polite live region and meets AA contrast.
- [x] By hand in the browser: `navigator.storage.persist()` is not called on page load. It is called once after the first successful save of the visit, and a refusal shows no notice.
- [x] `npm run build` and `npm test -- --watch=false` pass.
