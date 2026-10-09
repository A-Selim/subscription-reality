# Subscription Reality

> Small monthly payments feel cheap. Annual recurring spending often tells a different story.

A small, privacy-first web app that shows what your subscriptions really cost per year and helps you decide which ones are still worth keeping. No account, no backend, no bank connection: your data never leaves the browser.

## Features

- **Quick add:** name, price, monthly or yearly billing, currency (EUR, USD, GBP, EGP) and a reason. Usage frequency is estimated from the reason, and the last currency used is remembered.
- **See the reality:** one card per currency with the yearly total up front, the monthly total and a before/after comparison. Currencies are never mixed or converted.
- **Review one at a time:** confirm why you have each subscription and how often you use it, then choose **Keep**, **Unsure** or **Cancel**.
- **Potential savings:** subscriptions marked Cancel add up to an annual savings figure per currency. A rule-based insight names subscriptions you describe as optional and rarely use.
- **Edit and delete in place:** deleting asks whether you've actually cancelled with the provider, because removing a subscription from the app doesn't stop the payment.
- **Persistent and accessible:** data is saved in IndexedDB and survives refreshes and restarts. The UI targets WCAG AA and passes axe checks.

## Tech stack

| Area      | Choice                                                             |
| --------- | ------------------------------------------------------------------ |
| Framework | Angular 22: standalone components, signals, Signal Forms, zoneless |
| Styling   | SCSS                                                               |
| Storage   | IndexedDB, behind an `AppStorage` port                             |
| Tests     | Vitest + jsdom via `@angular/build:unit-test`                      |
| Language  | TypeScript (strict)                                                |

## Getting started

Requires Node.js `^22.22.3`, `^24.15.0` or `>=26`.

```bash
npm install
npm start                  # dev server at http://localhost:4200
npm test -- --watch=false  # run the test suite once
npm run build              # production build to dist/subscription-reality/browser
```

## Architecture

The app is a **single scrolling page** with no router ([ADR 0001](docs/adr/0001-single-page-no-routing.md)): top bar → hero → your recurring life → see the reality → review and savings. Each section is its own component.

```
src/app/
├── domain/        # Pure business rules: costs, estimated usage, review queue, savings, insights
├── state/         # SubscriptionsState (signals), AppStorage port, IndexedDB adapter, load-time validation
├── shared/        # Form schema and field directive shared by the add and edit forms
├── <section>/     # One folder per page section (hero, recurring-life, reality, review, savings, …)
└── testing/       # In-memory storage and render helpers for tests
```

- **Domain logic is pure.** All calculations live in `domain/subscription.ts` as plain functions, so they can be tested without Angular.
- **One source of truth.** `SubscriptionsState` holds the app state in signals. Components derive what they show with `computed()`.
- **Storage is swappable.** Components never touch IndexedDB. They go through the `AppStorage` port, which tests replace with an in-memory version.
- **Data is never silently lost.** Stored data is validated on load. Unreadable data is copied to a backup key before anything overwrites it, and the user sees a notice.

## Privacy and security

- Everything runs in the browser. The app makes no network requests and has no cookies or tracking.
- User text is only rendered through Angular's escaping bindings, never as raw HTML.
- The production build ships a hash-based Content-Security-Policy (`security.autoCsp`). The HTTP headers to set on the host are in [`docs/deployment.md`](docs/deployment.md).

## Documentation

| File                                                     | Purpose                                                 |
| -------------------------------------------------------- | ------------------------------------------------------- |
| [`docs/project-brief.md`](docs/project-brief.md)         | The original product brief                              |
| [`docs/agreed-changes.md`](docs/agreed-changes.md)       | Decisions made after the brief; these take precedence   |
| [`CONTEXT.md`](CONTEXT.md)                               | Domain glossary (Review decision, Potential savings, …) |
| [`docs/adr/`](docs/adr/)                                 | Architecture decision records                           |
| [`docs/deployment.md`](docs/deployment.md)               | Hosting requirements, security headers, caching         |
| [`docs/research/`](docs/research/)                       | Background research (browser storage)                   |
| [`docs/prototype/index.html`](docs/prototype/index.html) | Visual reference prototype                              |

## Roadmap

- Export and import your data as a JSON file, the only way to keep a backup with no server.
- Clearer guidance when saved data can't be loaded.
- Optional single total converted into one chosen currency.
