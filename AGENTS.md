You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

# Project: Subscription Reality

## Context

- Requirements come from two files. Read both before any task:
  - `docs/project-brief.md`: the original brief, kept unchanged as the starting point.
  - `docs/agreed-changes.md`: decisions made after the brief (add form, estimated usage, one reality card per currency, review order, edit and delete flow). **It wins over the brief and the prototype wherever they differ.**
- `docs/prototype/index.html` is the visual reference. Match its look and layout, and follow `docs/agreed-changes.md` for behavior.
  Never edit it or import from it.
- `CONTEXT.md` is the domain glossary. Name code, UI copy and tests with its terms (e.g. _Review decision_, _Potential savings_, _Review candidate_).
- `docs/adr/` records deliberate decisions. Read these before changing app structure.
- Stack: Angular 22 + SCSS.

## Commands

- Dev: `npm start`
- Test: `npm test -- --watch=false`
- Build: `npm run build`

## Workflow Rules

- Small, focused changes. One task = one concern.
- No new dependencies without asking.
- A task is "done" only when it builds and tests pass.
- Follow the existing folder structure and file naming (kebab-case files).

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Build the app as one page, with its sections as components and no router (see `docs/adr/0001-single-page-no-routing.md`). Lazy-load a feature route only if a real second page is ever agreed.
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- Every form control MUST have a real `<label>`. In compact layouts (such as the add form) the label may be visually hidden, but a placeholder is never the only label. Placeholder text must still meet AA contrast.
- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection

## Storage

- Keep app state in IndexedDB, behind the `AppStorage` port. Do NOT add localStorage or another store; it is no safer (see `docs/research/browser-storage.md`).
- Never block saving after a failed load. Never overwrite unreadable stored data without a backup copy.
- Follow `docs/agreed-changes.md` › Storage for the storage notices and `navigator.storage.persist()`.
