# 49: Security hardening: check names on load, hash-based script CSP

Status: resolved
Lane: small
Blocked by: none
Test seam: Unit seam (new `app-state-guard.spec.ts`); build output check for the CSP
Spec: Owner request (2026-10-09), after a whole-project security review. The review found no app vulnerabilities; these are hardening steps before deploy. The host is not chosen yet, so nothing here may depend on one.

## Why

1. `isAppState` in `src/app/state/indexed-db-app-storage.ts` checks every stored field, but for `name` it only checks that it is a string. The add and edit forms never save an empty name or one longer than 40 characters, so loaded data should follow the same rule.
2. `src/index.html` has no Content-Security-Policy. Angular's `security.autoCsp` build option adds a hash-based script policy as a `<meta>` tag at build time. It works on any static host, needs no server nonce, and blocks injected scripts if a bug ever let one in.

## What to build

1. Move `isAppState` (and its small helpers `isOneOf`, `isNonNegativeInteger`) out of `indexed-db-app-storage.ts` into a new `src/app/state/app-state-guard.ts`, exported. `indexed-db-app-storage.ts` imports it. No behaviour change apart from step 2.
2. In `isAppState`, check each subscription name with the existing `isValidName` from `src/app/domain/subscription.ts` (trimmed, 1 to `NAME_MAX_LENGTH` characters) instead of only `typeof === 'string'`. Data that fails is treated as unreadable, exactly as today: it goes to the backup key and the "couldn't be read" notice shows.
3. Add `src/app/state/app-state-guard.spec.ts`: a valid state passes; an empty name, a whitespace-only name and a 41-character name fail; a 40-character name passes; keep at least one case for an existing rule (e.g. price 0 fails) so the move is covered.
4. In `angular.json`, set `"security": { "autoCsp": true }` in the **production** build configuration only (`projects.subscription-reality.architect.build.configurations.production`). Do not add it to the base options: `ng serve` runs the development configuration with Vite's inline scripts, and it must keep working.

## Do not

- Do not edit `src/index.html` (no hand-written CSP meta tag: a second policy with `default-src` would block the hashed loader script).
- Do not add dependencies.
- Do not touch `docs/` (the orchestrator writes the deployment notes).

## Acceptance criteria

- [x] `isAppState` lives in `src/app/state/app-state-guard.ts` and rejects stored names that `isValidName` rejects.
- [x] `app-state-guard.spec.ts` covers the cases in step 3.
- [x] `npm run build` output `dist/subscription-reality/browser/index.html` starts `<head>` with a `<meta http-equiv="Content-Security-Policy">` whose `script-src` has `'strict-dynamic'` and `sha256-` hashes.
- [x] `npm start` (development) still serves the app with no CSP errors in the console.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

- `npm test -- --watch=false` passed (3 files, 246 tests). `npm run build` exited with code 134 in this sandbox before regenerating `dist/`, so the production CSP output could not be checked here. `npm start` was intentionally skipped per the ticket gates.
- Orchestrator (2026-10-09): build verified outside the sandbox. `index.html` starts with the CSP meta tag (`script-src 'strict-dynamic' 'sha256-…' https: 'unsafe-inline'; object-src 'none'; base-uri 'self'`). Served `dist/` locally with the header from `docs/deployment.md`: the app loads, adding a subscription works and survives a reload, the inline component styles and the `data:` chevron load, and the console shows no CSP errors. An injected `<img onerror>` handler is blocked. A script created by already-running code still runs, as `'strict-dynamic'` intends, so the AGENTS.md rule against HTML bindings still matters. `npm start` has no CSP and no console errors. Made the guard's two helpers private again and dropped an unrelated Prettier reformat in `angular.json`. 246 tests pass.
