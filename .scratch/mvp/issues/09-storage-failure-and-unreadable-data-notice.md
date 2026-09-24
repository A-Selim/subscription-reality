# 09: Storage failure and unreadable data notice

Status: ready-for-agent
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

## Acceptance criteria

- [ ] With a failing load, the page renders the empty state, adding still works, and the notice says changes only last for this visit.
- [ ] With a failing save, the added subscription still shows, and the notice appears.
- [ ] After a failing save, a later successful save removes the notice.
- [ ] With the fake rejecting `load()` with `UnreadableStateError`, the page starts empty and the notice explains the saved data couldn't be read.
- [ ] By hand in the browser: write a malformed value under the state key in DevTools and reload. The page starts empty with the notice, and the malformed value is still there under the backup key.
- [ ] The notice is a polite live region and meets AA contrast.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
