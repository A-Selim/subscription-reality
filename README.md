# Subscription Reality

> Small monthly payments feel cheap. Annual recurring spending often tells a different story.

Subscription Reality is a small web app for seeing what your subscriptions really cost per year and deciding which ones still deserve to stay. It's meant to feel reflective, like a quick personal check-in, not like a finance dashboard.

Everything stays on your device. There's no account, no backend and no bank connection.

## How it works

1. **Add your subscriptions.** Enter a name, price, whether you pay monthly or yearly, the currency, and why you have it. Your currency is remembered for the next subscription, and the app estimates how often you use each one from your reason.
2. **See the reality.** Each currency gets its own card showing what you pay per month and, more prominently, per year. Currencies are never mixed or converted.
3. **Review one at a time.** For each subscription, answer _Why do you still have it?_ and _How often do you actually use it?_, then choose **Keep**, **Unsure** or **Cancel**.
4. **See what you could save.** Subscriptions marked Cancel add up to your potential annual savings. A short insight names the subscriptions you describe as optional and rarely use.

You can edit or delete any subscription in place. Deleting asks whether you've actually cancelled it with the provider, because removing it from the app doesn't stop the payment.

**Currencies:** EUR, USD, GBP and EGP. **Billing:** monthly or yearly. **Storage:** IndexedDB in your browser, so your data survives refreshes and restarts.

## Development

Built with Angular 22 and SCSS.

```bash
npm install
npm start                  # dev server at http://localhost:4200
npm test -- --watch=false  # unit tests
npm run build              # production build
```

## Project docs

- [`docs/project-brief.md`](docs/project-brief.md): the original product brief
- [`docs/agreed-changes.md`](docs/agreed-changes.md): decisions made after the brief, which take precedence over it
- [`CONTEXT.md`](CONTEXT.md): the domain glossary
- [`docs/adr/`](docs/adr/): architecture decision records
- [`docs/prototype/index.html`](docs/prototype/index.html): the visual prototype
