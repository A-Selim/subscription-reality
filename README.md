# Subscription Reality

**Small monthly payments feel cheap. Annual recurring spending often tells a different story.**

A small, privacy-first web app that shows what your subscriptions really cost per year and helps you decide which ones are still worth keeping. No account, no backend, no bank connection: your data never leaves the browser.

**Live demo: [subscription-reality.pages.dev](https://subscription-reality.pages.dev/)**

Built with **Angular 22** (standalone components, signals, Signal Forms, zoneless), **TypeScript (strict)** and **IndexedDB**, with 248 tests and a WCAG AA target.

![The yearly total of €1,539 with a before and after comparison, the review card for one subscription, and €826 of potential annual savings with an insight](docs/images/app-overview.png)

## The problem

People pay for many small subscriptions. Each one feels cheap on its own, so they rarely see the whole picture: what they pay per year, and which subscriptions they no longer use. Finance dashboards feel heavy, and bank-connected tools ask for a lot of trust. This app turns the list into one clear yearly number, then walks through it one subscription at a time.

## Features

- **Quick add:** name, price, monthly or yearly billing, currency (EUR, USD, GBP, EGP) and a reason. Usage frequency is estimated from the reason, and the last currency used is remembered.
- **See the reality:** one card per currency with the yearly total up front, the monthly total and a before/after comparison. Currencies are never mixed or converted.
- **Review one at a time:** confirm why you have each subscription and how often you use it, then choose **Keep**, **Unsure** or **Cancel**.
- **Potential savings:** subscriptions marked Cancel add up to an annual savings figure per currency. A rule-based insight names subscriptions you describe as optional and rarely use.
- **Edit and delete in place:** deleting asks whether you've actually cancelled with the provider, because removing a subscription from the app doesn't stop the payment.
- **Persistent and accessible:** data is saved in IndexedDB and survives refreshes and restarts. The UI targets WCAG AA and passes axe checks.

![Subscription cards with monthly price, annual cost, reason and usage, above the quick add form](docs/images/subscription-cards.png)

## Engineering highlights

- **Pure domain layer.** Costs, usage estimates, the review queue, savings and insights are plain TypeScript functions in `domain/subscription.ts`, with no Angular imports. They are tested directly and reused by every component.
- **Signals end to end.** One `SubscriptionsState` service owns the state in signals. Components derive what they show with `computed()`, and the app runs zoneless with OnPush by default.
- **Ports and adapters for storage.** Components never touch IndexedDB. They go through an `AppStorage` port: IndexedDB in the app, an in-memory fake in tests. Saves run one at a time, so an older save can never overwrite a newer one.
- **No silent data loss.** Stored data is validated field by field on load with the same rules the forms use. Unreadable data is copied to a backup key before anything overwrites it, and a calm notice tells the user. If storage fails, the app keeps working for the visit and says so.
- **Accessibility by design.** Every control has a real label. Focus moves on purpose: to the totals after the first add, and back to the card after a dialog closes. Native `<dialog>` traps focus, and status changes are announced through live regions.
- **Security.** User text is only rendered through Angular's escaping bindings. The production build ships a hash-based Content-Security-Policy (`security.autoCsp`), and [`public/_headers`](public/_headers) adds the rest of the policy and the security headers on the host.
- **Small and fast.** No runtime dependencies beyond Angular. The initial bundle is about 75 kB compressed.

## Testing

```bash
npm test -- --watch=false
```

- **248 tests** with Vitest and jsdom, through `@angular/build:unit-test`.
- Most tests render the whole page and use it as a user would: they find regions, buttons and fields by their accessible names, so a broken label fails a test. A shared helper renders the app on the in-memory storage, and rendering it again on the same storage simulates a reload.
- The domain rules and the load-time validation have their own unit tests.
- Accessibility is checked by hand with axe on each key state (empty, several currencies, review in progress, dialog open, storage notice).

## Tech stack

| Area      | Choice                                                             |
| --------- | ------------------------------------------------------------------ |
| Framework | Angular 22: standalone components, signals, Signal Forms, zoneless |
| Language  | TypeScript (strict)                                                |
| Styling   | SCSS                                                               |
| Storage   | IndexedDB, behind an `AppStorage` port                             |
| Tests     | Vitest + jsdom via `@angular/build:unit-test`                      |
| Tooling   | Angular CLI, Prettier                                              |

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

## License

[MIT](LICENSE) © 2026 Ahmed Selim
