# 01 — Remove the router

Status: ready-for-agent

First MVP task. It must land before any feature work.

## Why

The app is a single page with no routing ([ADR 0001](../../../docs/adr/0001-single-page-no-routing.md)). The Angular CLI scaffold still wires up an empty router, which invites later tasks to add routes.

## Scope

- Delete `src/app/app.routes.ts`.
- `src/app/app.config.ts`: remove `provideRouter(routes)` and its imports. Keep `provideBrowserGlobalErrorListeners()`.
- `src/app/app.ts`: remove the `RouterOutlet` import and its entry in `imports`.
- `src/app/app.html`: remove `<router-outlet />`. Leave the rest of the placeholder template alone; a later task replaces it.
- Run `npm uninstall @angular/router` so `package.json` and `package-lock.json` no longer list it.

## Out of scope

- Replacing the placeholder template or building any app sections.

## Done when

- `grep -rn "router" src package.json` finds nothing.
- `npm run build` succeeds.
- `npm test -- --watch=false` passes.
