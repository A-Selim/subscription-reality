# Browser storage: localStorage vs IndexedDB

Researched 2026-09-30 for the question: "Which is best, localStorage or IndexedDB, and can we guarantee 100% that data saves and loads?"

## Short answer

- **No browser API can guarantee 100%.** Browsers may clear best-effort data under storage pressure [[Storage]](#sources). Users can always clear site data [[web.dev]](#sources). Safari can delete script-written data after 7 days of use with no interaction [[MDN-quota]](#sources). A cleared store looks just like a first visit, so the app can't even detect it (inference).
- **Switching between localStorage and IndexedDB doesn't change that.** Both live in the same origin storage and follow the same eviction and persistence rules [[MDN-quota]](#sources) [[web.dev]](#sources).
- **Keep IndexedDB.** It's already built, it's async, and it stores objects directly. localStorage is strings only and has no locking between tabs [[HTML]](#sources) [[MDN-ls]](#sources).
- **Call `navigator.storage.persist()` after the first successful save.** Don't call it on page load, because Firefox shows a permission prompt [[MDN-quota]](#sources). This protects against automatic eviction, not against the user clearing data [[web.dev]](#sources).
- **Only a copy outside the browser is fully safe.** That means a file the user saves, or a backend with sync. Both are outside the MVP scope.

## 1. localStorage vs IndexedDB

| | localStorage | IndexedDB |
|---|---|---|
| API style | Synchronous: `getItem` returns the value directly, so it runs on the main thread [[HTML]](#sources) | Async requests and transactions [[MDN-idb]](#sources) |
| Data types | UTF-16 strings only [[MDN-ls]](#sources) | Structured-clone values (objects, arrays, dates…) [[IDB]](#sources) |
| Size limit | 5 MiB per origin [[MDN-quota]](#sources); the HTML spec sets no number [[HTML]](#sources) | Shares the origin quota: Chrome up to 60% of disk, Firefox best-effort min(10% disk, 10 GiB), Safari 17+ about 60% for the browser app [[MDN-quota]](#sources) [[WebKit-2023]](#sources) |
| Private / incognito | Cleared when the last private tab closes [[MDN-ls]](#sources) | "only lasts in-memory until the incognito session is closed" [[MDN-idb]](#sources) |
| Durability | Spec doesn't say when data reaches disk [[HTML]](#sources) | Spec hints: `strict` = on disk before `complete`; `relaxed` = handed to the OS only [[IDB]](#sources). Chrome's default has been `relaxed` since Chrome 121 [[Chrome-121]](#sources) |
| Errors | `QuotaExceededError` on `setItem` (quota full or storage disabled); `SecurityError` on access (opaque origin, `file:`/`data:`, or user blocks storage/cookies) [[HTML]](#sources) [[MDN-ls]](#sources) | `QuotaExceededError`, `AbortError`, `UnknownError` (transient), `VersionError`, `InvalidStateError` [[IDB]](#sources) [[MDN-tx]](#sources). On browser quit or permission loss, open transactions abort with `AbortError` [[MDN-idb]](#sources) |
| Multi-tab | `storage` event fires in other tabs, and "authors are encouraged to assume that there is no locking mechanism" [[HTML]](#sources) | Transactions are atomic, but schema upgrades are `blocked` until other tabs close or handle `versionchange` [[IDB]](#sources) [[MDN-idb]](#sources) |

A key point from MDN: "there is no way to guarantee that IndexedDB transactions will complete, even with normal browser shutdown" [[MDN-idb]](#sources).

## 2. Eviction and persistence

- **Buckets.** Each origin's storage bucket is `"best-effort"` or `"persistent"`, and it starts as best-effort. Under storage pressure the browser "should clear" best-effort buckets. It "cannot clear storage marked as persistent without involvement from the origin or user" [[Storage]](#sources).
- **LRU eviction.** When the disk is low, browsers delete the least recently used origin's data first and skip persistent origins [[MDN-quota]](#sources). Safari 17 also uses LRU and excludes persistent origins [[WebKit-2023]](#sources).
- **`persist()`** returns a promise of `true` or `false`. "The browser may or may not honor the request". It needs HTTPS, and it has been Baseline since December 2021 [[MDN-persist]](#sources).
  - Chrome decides silently from engagement, install or bookmark, and notification permission. If those signals are missing, it just returns `false` [[web.dev]](#sources).
  - Firefox shows the user a permission popup [[MDN-quota]](#sources).
  - Safari decides by heuristics "like whether the website is opened as a Home Screen Web App" [[WebKit-2023]](#sources).
- **`persisted()` / `estimate()`** report the current mode, usage and quota. Safari has fully supported `estimate()` since 17.0 [[WebKit-2023]](#sources).
- **Safari 7-day cap.** With tracking prevention on, Safari deletes all script-writable storage (IndexedDB, localStorage and others) after seven days *of Safari use* with no user interaction on the site [[WebKit-2020]](#sources) [[MDN-quota]](#sources). Home-screen web apps "have their own counter of days of use", and WebKit says "We do not expect the first-party in such a web application to have its website data deleted" [[WebKit-2020]](#sources). That is an expectation, not a promise.
- **User clears site data.** Persistence does not protect against this [[web.dev]](#sources). It also deletes OPFS [[MDN-opfs]](#sources).

## 3. Can 100% be guaranteed?

**No, not purely client-side.** Facts: best-effort data can be evicted [[Storage]](#sources), users can clear anything [[web.dev]](#sources), private mode throws data away [[MDN-idb]](#sources), and transactions may not complete on shutdown [[MDN-idb]](#sources).

*Inference:* after eviction or clearing, the store is simply empty. `load()` returns `null`, exactly like a first visit, so no in-app notice can catch this case.

What the app *can* guarantee is that it **knows** when a save or load fails, because every failure path above produces an error or abort event. It can then tell the user.

Options beyond browser storage:

| Option | Survives clearing site data? | Support | Complexity |
|---|---|---|---|
| **Export JSON file** (Blob + `<a download>`) and **Import** (`<input type="file">`) | Yes, the file lives in the user's Downloads | `download` works for `blob:` URLs [[MDN-a]](#sources); universal | Low, no dependencies. The user has to remember to export |
| File System Access API (`showSaveFilePicker`) | Yes | Not Baseline, experimental [[MDN-fsa]](#sources); Chrome/Edge desktop only, about 31% of users [[caniuse]](#sources) | Medium, and still needs a fallback |
| OPFS | **No**, it uses the same quota and gets cleared with site data [[MDN-opfs]](#sources) | Baseline since March 2023 [[MDN-opfs]](#sources) | Adds nothing over IndexedDB |
| Backend + sync | Yes | Any | **High**: a server, accounts, auth, conflict handling and new dependencies. Out of scope for this app |

## 4. Recommendation for this app

*These are inferences built on the facts above.*

1. **Keep IndexedDB** and the current single-record design. localStorage would give no durability or eviction benefit. It would add string serialization, and it blocks the main thread.
2. **Add `{ durability: 'strict' }` to the save transaction** (optional, one line). Writes are tiny and rare, so the cost is negligible. It closes the power-loss or OS-crash gap that Chrome's `relaxed` default leaves open [[Chrome-121]](#sources). Chrome says most apps need no action, so this is a small hardening step, not a fix.
3. **Call `navigator.storage.persist()` once, after the first successful save**, not on page load. That avoids a Firefox prompt on a first visit before the user has entered anything. Ignore a `false` result: it's the normal outcome in Chrome and Safari without engagement, and it isn't a failure.
4. **Show the ticket-09 notice for these cases:**
   - Opening the database fails (e.g. `SecurityError`, storage disabled by policy): show the "only for this visit" notice.
   - Save rejects (`QuotaExceededError`, `AbortError`, `UnknownError`, or `InvalidStateError` after the connection closes): show the "only for this visit" notice.
   - Load rejects for any other reason: show the "only for this visit" notice.
   - Data is present but unreadable: show the "couldn't be read" notice. The current adapter already does the backup.
   - `persist()` returns `false`: no notice.
   - Silent eviction or user clearing: can't be detected, so no notice is possible.
5. **Known risks, not ticket-09 work:**
   - Two open tabs each `put` the whole state under `current`, so the last write wins and silently overwrites the other tab. Neither API prevents this.
   - The adapter has no `onblocked` or `onversionchange` handler. That will matter the first time the database version is bumped [[MDN-idb]](#sources).

## Sources

- <a id="sources"></a>**[HTML]** WHATWG HTML Standard, Web Storage: https://html.spec.whatwg.org/multipage/webstorage.html
- **[Storage]** WHATWG Storage Standard: https://storage.spec.whatwg.org/
- **[IDB]** W3C Indexed Database API 3.0 (Working Draft, 13 Aug 2025): https://www.w3.org/TR/IndexedDB/
- **[MDN-quota]** MDN, Storage quotas and eviction criteria: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- **[MDN-ls]** MDN, Window.localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **[MDN-idb]** MDN, Using IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
- **[MDN-tx]** MDN, IDBDatabase.transaction(): https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/transaction
- **[MDN-persist]** MDN, StorageManager.persist(): https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- **[MDN-opfs]** MDN, Origin private file system: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
- **[MDN-fsa]** MDN, showSaveFilePicker(): https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker
- **[MDN-a]** MDN, `<a>` element (download attribute): https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a
- **[web.dev]** Google web.dev, Persistent storage: https://web.dev/articles/persistent-storage
- **[Chrome-121]** Chrome for Developers, IndexedDB durability mode now defaults to relaxed: https://developer.chrome.com/blog/indexeddb-durability-mode-now-defaults-to-relaxed
- **[WebKit-2020]** WebKit blog, Full Third-Party Cookie Blocking and More: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- **[WebKit-2023]** WebKit blog, Updates to Storage Policy: https://webkit.org/blog/14403/updates-to-storage-policy/
- **[caniuse]** caniuse, File System Access API: https://caniuse.com/native-filesystem-api
