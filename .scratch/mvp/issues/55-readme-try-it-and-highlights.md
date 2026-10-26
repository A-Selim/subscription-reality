# 55: README "Try it" line, shorter highlights, and drop the shared-origin limit

Status: resolved
Lane: small
Blocked by: 54
Test seam: README read-through by the orchestrator; existing tests and build must still pass
Spec: Owner request (2026-10-26). Make the README faster to skim for technical recruiters.

## Why

- The shared-origin bullet in "Limits" reads like a security warning but is a maintainer note. `docs/deployment.md` › Keep one origin already covers it.
- Readers reach the GIF before they are told what to do with the live demo.
- "Engineering highlights" has seven long bullets. Recruiters skim, so each point should fit on one line and lead with the skill it shows.

## What to build

All changes are in `README.md`.

1. **Limits:** delete the bullet that starts "Other projects on the same `a-selim.github.io` address". Leave the other three bullets as they are.
2. **Try it:** directly under the `**Live demo: …**` line, add a blank line and then this line:
   `Try it: add three subscriptions you pay for and see your yearly total. Nothing to sign up for.`
3. **Engineering highlights:** replace the seven bullets with exactly these seven, in this order:
   ```markdown
   - **Modern Angular 22.** Standalone components, signals end to end, Signal Forms, zoneless change detection with OnPush by default.
   - **Clean architecture.** Business rules are pure TypeScript in `domain/subscription.ts` with no Angular imports. Storage sits behind an `AppStorage` port: IndexedDB in the app, an in-memory fake in tests.
   - **Tested like a user.** 248 tests render the page and find controls by their accessible names, so a broken label fails a test.
   - **Accessible.** WCAG AA target and axe-clean: real labels, focus that moves on purpose, native `<dialog>` and live regions for status changes.
   - **Safe with data.** Stored data is validated field by field on load. Unreadable data is backed up, never overwritten, and saves run in order so an older save can't win.
   - **Secure by default.** User text only goes through Angular's escaping bindings, and the build ships a hash-based Content-Security-Policy (`security.autoCsp`). See [hosting and headers](docs/deployment.md).
   - **Small and fast.** No runtime dependencies beyond Angular. The initial bundle is about 75 kB compressed.
   ```

## Do not

- Do not change any other section, image or file.
- Do not reference `docs/images/linkedin.gif` or `docs/images/linkedin.mp4`.
- Do not commit.

## Acceptance criteria

- [x] The shared-origin bullet is gone; the other Limits bullets are unchanged.
- [x] The "Try it" line sits right under the live demo line.
- [x] "Engineering highlights" has exactly the seven bullets above.
- [x] Every relative link in `README.md` still resolves.
- [x] `npm test -- --watch=false` and `npm run build` pass.

## Comments

- 2026-10-26: Implemented by Codex, reviewed by Claude. Tests (248) and build pass, links resolve. Claude corrected "248 tests render the page" to "Most render the whole page", since the domain rules have unit tests.
