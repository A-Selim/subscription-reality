# Spec — Subscription Reality MVP

Status: ready-for-agent

Sources: `docs/project-brief.md`, `docs/agreed-changes.md` (wins on conflict), `docs/prototype/index.html` (visual reference), `CONTEXT.md` (vocabulary), ADR 0001 (single page, no router).

## Problem Statement

People pay for many small recurring subscriptions. Each one feels cheap on its own, so they rarely see the whole picture. They don't know what they pay per year across all subscriptions, and they don't know which subscriptions they no longer use or value. Finance dashboards feel heavy and analytical. Bank-connected tools ask for too much trust. So these people never take a quiet moment to go through the list and decide what still deserves to stay.

## Solution

A single, calm web page that runs entirely in the browser and keeps its data on the user's device. The user:

1. Lands on an empty _Your recurring life_ section that invites them to add their first **Subscription**.
2. Adds subscriptions through a short form: name, price, **Billing frequency**, currency and **Reason**. **Usage** is estimated from the reason.
3. Sees the reality: for each currency, a card with the **Annual cost** (prominent), the **Monthly cost**, the number of subscriptions, the number of **Rarely used** subscriptions, and a before/after comparison. Currencies are never combined.
4. Reviews one subscription at a time. They confirm or correct the reason and usage, then record a **Review decision**: Keep, Unsure or Cancel.
5. Sees **Potential savings** per currency, Keep/Unsure/Cancel counts, and one insight naming their **Review candidates**.
6. Can edit a subscription in place, or delete it after being reminded that deleting here doesn't stop the payment.

Everything survives a refresh, a browser restart and reopening the app.

## User Stories

### Landing and empty state

1. As a first-time visitor, I want to see a short hero that explains that small monthly charges add up, so that I understand what the app is for before doing anything.
2. As a first-time visitor, I want a "Start adding" action in the top bar, so that I can jump straight to adding subscriptions.
3. As a first-time visitor, I want the _Your recurring life_ section to ask "What are you paying for every month?", so that I start thinking about my recurring payments.
4. As a first-time visitor, I want to see example categories (Streaming, AI tools, Cloud storage, Gym, News, Software), so that I remember subscriptions I'd otherwise forget.
5. As a first-time visitor, I want one clear primary action, "Add your first subscription", so that I know exactly what to do next.
6. As a first-time visitor, I want the _See the reality_ and review sections to appear dimmed, with no working controls, until I add something, so that I can see what's coming without meeting dead buttons.
7. As a keyboard or screen-reader user, I want the dimmed sections' explanatory text to stay readable (by screen readers and at AA contrast) while they contain nothing to focus, so that I understand what unlocks them.
8. As a returning visitor, I want my saved subscriptions to show immediately, without a flash of the empty state, so that the app feels reliable.

### Adding a subscription

9. As a user, I want to add a subscription with a name, price, billing frequency, currency and reason, so that I can capture it quickly.
10. As a user, I want the add form to have no usage field, so that adding stays fast and I refine usage later in the review.
11. As a user, I want a small, centred, muted note at the bottom of the add box saying that usage is estimated from the reason, so that I know where the usage on my cards comes from.
12. As a user, I want the reason to start on _Essential_, so that I can add a subscription without making a choice I'm not sure about yet.
13. As a user, I want billing frequency to start blank on every new subscription, so that a value from my previous entry isn't carried over by mistake.
14. As a first-time user, I want the currency to start blank until I pick one, so that the app doesn't assume where I live.
15. As a returning user, I want the currency to start on my **Preferred currency**, the currency of the subscription I most recently created, so that I don't pick it again every time.
16. As a user, I want to change the currency on any subscription I add, so that I can track payments in EUR, USD, GBP and EGP.
17. As a user, I want the preferred currency to change only when I actually create a subscription, not when I just change the dropdown, so that abandoned input doesn't change my default.
18. As a user, I want the name trimmed and limited to 40 characters, so that cards stay tidy.
19. As a user, I want to be stopped from adding a name I already have (ignoring case and surrounding spaces), with the message "You already have Netflix. Add something to tell them apart, like 'Netflix Family'.", so that I don't create accidental duplicates but can still track two accounts.
20. As a user, I want the price to be required, greater than 0 and to have at most 2 decimal places, so that my totals are meaningful.
21. As a user, I want name, price, billing frequency and currency to be required, so that every subscription can be costed.
22. As a user, I want validation errors to appear as a toast just above the form's Add button, so that the error appears where I'm already looking.
23. As a user, I want the invalid field to get a red outline and receive focus, so that I can fix it immediately.
24. As a screen-reader user, I want validation toasts announced, so that I know why the add didn't work.
25. As a user, I want a confirmation toast when a subscription is added, so that I know it worked.
26. As a user, I want the form to clear its name, price and billing fields after a successful add, and keep the reason on _Essential_ and the currency on my preferred currency, so that I can add the next one straight away.
27. As a user, I want the add form to stay visible below my subscription cards once I have some, so that I can keep adding without hunting for it.
28. As a user adding my first subscription, I want the page to guide me towards _See the reality_, so that I see the payoff right away.

### Subscription cards

29. As a user, I want each subscription shown as a simple card with a monogram, name, price with its billing frequency, annual cost, reason and usage, so that I can scan my recurring life at a glance.
30. As a user, I want estimated and confirmed usage to look the same on cards, so that the list stays calm and uncluttered.
31. As a user, I want cards in the order I added them, so that the list is predictable.

### Estimated usage

32. As a user, I want usage estimated from the reason when I add a subscription (Essential, High Value and Work / Learning → Daily; Convenience → Weekly; Nice to Have → Monthly; Occasional Use → Rarely), so that my rarely used count is sensible from the start.
33. As a user, I want _Almost Never_ never to be estimated, so that only I can say that about a subscription.
34. As a user, I want the estimated usage to follow when I change the reason while editing, until I've confirmed usage, so that the estimate stays consistent.
35. As a user, I want my usage to be confirmed the first time I make a review decision on a subscription in the review, and never overwritten by an estimate after that, so that my own answer wins. Answering "Not yet, keep it" when deleting doesn't count as confirming usage.

### See the reality

36. As a user, I want one reality card per currency, stacked full-width, so that different currencies are never added together with made-up exchange rates.
37. As a user with only one currency, I want exactly one card that looks like the prototype, so that the common case stays simple.
38. As a user, I want the currency cards ordered by when I first used each currency among my current subscriptions, so that the order is stable and meaningful.
39. As a user, I want the annual **Recurring cost** to be the biggest number on each card, so that I feel the real scale of my spending.
40. As a user, I want the monthly recurring cost shown under it, so that I can connect it to what I see on my bank statement.
41. As a user, I want each card to count the subscriptions in that currency, so that I know what the total is made of.
42. As a user, I want each card to count the rarely used subscriptions (usage Rarely or Almost Never, estimated or confirmed) in that currency, so that I notice waste.
43. As a user, I want a before/after comparison on each card: the annual total now, and the annual total if I cancel the subscriptions marked Cancel, so that I can see what my decisions are worth.
44. As a user, I want subscriptions marked Cancel to stay in the totals, so that the numbers reflect what I still actually pay until I cancel with the provider.
45. As a user, I want totals to update immediately when I add, edit, review or delete, so that the picture is always current.
46. As a user, I want money formatted with the right symbol (€, $, £, E£), annual figures in whole units (with cents only when rounding would turn a non-zero amount into zero) and monthly figures with 2 decimals, so that the numbers read naturally and never show a false zero.

### Review

47. As a user, I want to review one subscription at a time, so that the review feels light rather than like a spreadsheet.
48. As a user, I want undecided subscriptions first, in the order I added them, so that I work through what I haven't looked at yet.
49. As a user, I want the review to always open on the first undecided subscription, even after reloading, so that I never lose my place and never need a saved position.
50. As a user, I want to see the subscription's name, annual cost and monthly cost in the review, so that I judge it with the real numbers in front of me.
51. As a user, I want to be asked "Why do you still have it?" with my current reason selected, so that I can confirm or change it.
52. As a user, I want to be asked "How often do you actually use it?" with my current usage selected, so that I can confirm or correct it.
53. As a user, I want reason and usage changes in the review saved straight away, so that my totals and insights react while I think.
54. As a user, I want Keep, Unsure and Cancel buttons, so that I can record my verdict in one tap.
55. As a user, I want choosing a decision to record it, confirm the usage and move to the next subscription, so that the review keeps flowing.
56. As a user, I want no extra message when I choose Cancel, so that the review stays guilt-free.
57. As a user, I want a progress bar showing how many subscriptions have a decision, so that I know how far along I am.
58. As a user, I want a _Review complete_ state when no undecided subscriptions remain, so that I get a sense of closure.
59. As a user, I want _Review again_ to walk through every subscription with its current decision shown as selected, so that I can revisit my verdicts.
60. As a user, I want a subscription I add after finishing the review to join the queue as undecided, so that nothing escapes review.
61. As a user with no subscriptions, I want the review area to say that the review starts once I add something, so that it isn't just an empty box.
62. As a keyboard or screen-reader user, I want the reason, usage and decision buttons to announce which one is selected, so that I know the current state without seeing it.
63. As a keyboard user, I want focus to move to the next subscription's review content after I decide, so that I can keep reviewing without tabbing back.

### Potential savings and counts

64. As a user, I want a single dark savings card next to the review, so that the payoff sits beside my decisions.
65. As a user, I want **Potential savings** shown as one line for each currency I have subscriptions in (the annual cost of subscriptions marked Cancel, zero included), so that savings are never combined across currencies.
66. As a user, I want a Cancel decision to count toward potential savings immediately, so that I see the effect of each choice.
67. As a user, I want Keep, Unsure and Cancel counts across all currencies, so that I see how my review is going overall.
68. As a user, I want Unsure to show only as a count, so that "maybe" doesn't inflate my savings.

### Insight

69. As a user, I want one plain-language insight when I have **Review candidates** (reason Nice to Have, Convenience or Occasional Use, and usage Rarely or Almost Never), e.g. "You spend €120 and $60 per year on subscriptions you describe as optional and rarely use.", so that I see what my optional, unused subscriptions cost.
70. As a user, I want the names of those review candidates listed underneath in a muted line (e.g. "Adobe · Headspace · Audible"), so that the insight points at specific subscriptions.
71. As a user, I want to select a name in that line to bring that subscription up in the review, so that I can act on the insight straight away.
72. As a user with subscriptions but no review candidates, I want a gentle placeholder saying the review will surface subscriptions that look out of line with how I use them, so that the box isn't empty.
73. As a user with no subscriptions, I want the insight box to tell me to add subscriptions first, so that I know what unlocks it.

### Editing

74. As a user, I want to select a subscription card to open it for editing in place, so that I can fix a mistake without leaving the page.
75. As a user, I want the edit form to show the same fields as the add form (name, price, billing frequency, currency and reason), so that editing feels familiar.
76. As a user, I want totals to update as I edit, so that I see the impact of a price or billing change immediately.
77. As a user, I want the same validation rules when editing, including being blocked from renaming to a name I already have, so that my data stays consistent.
78. As a user, I want editing to keep the subscription's review decision, so that fixing a typo doesn't undo my review.
79. As a user, I want editing a subscription's currency never to change my preferred currency, so that correcting an old entry doesn't change the default for new ones.
80. As a keyboard user, I want focus to return to the card after I close the edit form, so that I don't lose my place.

### Deleting

81. As a user, I want to delete a subscription, so that the app reflects the payments I actually still have.
82. As a user, I want to be asked "Did you already cancel {name}? Deleting it here doesn't stop the payment." before deleting, so that I don't mistake deleting for cancelling.
83. As a user, I want **Yes, delete it** to remove the subscription, so that the list only shows payments I still have.
84. As a user, I want **Not yet, keep it** to keep the subscription and set its decision to Cancel, so that it counts toward potential savings as a reminder.
85. As a keyboard or screen-reader user, I want the delete question to take focus when it opens and give focus back sensibly when it closes, so that I can answer it without a mouse.

### Persistence and privacy

86. As a user, I want my subscriptions, their decisions and my preferred currency to survive refreshes, browser restarts and reopening the app, so that my work isn't lost.
87. As a user, I want my data to stay on my device, with no account, backend or login, so that I can trust the app with my spending.
88. As a user whose browser blocks or fails storage, I want the app to keep working for the current visit and to tell me clearly that my changes won't be kept after I leave, so that I don't lose work without knowing.

### Look, feel and accessibility

89. As a phone user, I want the page to work on narrow screens, with cards and reality cards stacking, so that I can review on the go.
90. As any user, I want the page to match the prototype's calm, large-type, card-based look, so that it feels like a consumer product rather than a finance tool.
91. As an assistive-technology user, I want the page to pass AXE checks and meet WCAG AA contrast, focus and ARIA requirements, so that I can use every feature.

## Implementation Decisions

### Structure

- One page with no router (ADR 0001). The root component composes the section components in order: the top bar as the page `header`, then inside `main` the hero, _Your recurring life_, _See the reality_, then the review area with the review card and the savings card side by side (stacked on small screens). The hero holds the page's only `h1`, so it sits inside `main`.
- Components are standalone, small and focused: top bar, hero, recurring-life section (empty state, subscription card list, add form), subscription card (read view, in-place edit view, delete question), reality section (one reality card per currency), review card, savings card (savings lines, counts, insight), and toast. Components use `input()`/`output()`/`model()`; derived values use `computed()`.
- Visual styling follows the prototype. The prototype's markup and scripts are never imported.

### Domain module (pure, no Angular)

A single pure module holds all business rules. It is the domain test seam. It exposes functions over plain data:

- monthly cost and annual cost of a subscription (monthly = price or price / 12; annual = price × 12 or price)
- recurring cost per currency (monthly and annual), in first-used order among the given subscriptions
- rarely used check and count per currency
- estimated usage for a reason (the table in agreed-changes §5; never _Almost Never_)
- re-estimating usage on a reason change only while usage isn't confirmed
- review queue: undecided subscriptions in insertion order; the "Review again" pass runs over the live list of all subscriptions in insertion order
- potential savings per currency (annual cost of Cancel decisions), with a zero entry for every currency that has subscriptions; "after" total per currency = annual total − potential savings
- decision counts (Keep / Unsure / Cancel) across all currencies
- review candidates and their annual cost per currency
- name normalization (trim; compare case-insensitively) and uniqueness check that can exclude the subscription being edited
- price validity (> 0, at most 2 decimals) and name validity (required after trim, ≤ 40 chars)
- money formatting: currency symbols and locales as in the prototype (EUR en-DE €, USD en-US $, GBP en-GB £, EGP en-EG E£); annual amounts with 0 decimals, except that a non-zero amount that would round to zero shows 2 decimals; monthly and per-subscription amounts with 2 decimals
- joining amounts in prose: "A", "A and B", "A, B and C"

Data shape (a decision shape, adapted from the prototype's stored state):

```ts
type Currency = 'EUR' | 'USD' | 'GBP' | 'EGP';
type BillingFrequency = 'monthly' | 'yearly';
type Reason = 'Essential' | 'High Value' | 'Convenience' | 'Nice to Have' | 'Occasional Use' | 'Work / Learning';
type Usage = 'Daily' | 'Weekly' | 'Monthly' | 'Rarely' | 'Almost Never';
type ReviewDecision = 'keep' | 'unsure' | 'cancel';

interface Subscription {
  id: string;
  sequence: number;           // insertion order; never reused. Drives ordering, not timestamps
  name: string;               // trimmed
  price: number;
  billingFrequency: BillingFrequency;
  currency: Currency;
  reason: Reason;
  usage: Usage;
  usageConfirmed: boolean;    // true only once the user records a decision in the review
  decision: ReviewDecision | null; // null = undecided
}

interface AppState {
  version: 1;
  subscriptions: Subscription[];
  preferredCurrency: Currency | null; // null until the first subscription is created
  nextSequence: number;
}
```

- Code and data use `unsure`, never the prototype's `maybe`.
- `usageConfirmed` is stored, not derived from `decision`. Only a Keep, Unsure or Cancel choice made in the review sets it. _Not yet, keep it_ sets `decision` to Cancel but leaves `usageConfirmed` unchanged, because the user never answered the usage question. Reason edits re-estimate usage while `usageConfirmed` is false.
- The monogram on cards and in the review is derived from the name (first two characters, uppercased, as in the prototype). It is not stored.

### State service

- One singleton state service (`@Service`, signals) owns `AppState`, exposes read-only signals and `computed()` views built on the domain module, and offers intent methods: add, update, delete, set reason, set usage, decide (sets `decision` and `usageConfirmed`), keep-as-cancel (from the delete question; sets `decision` only).
- The service sets the preferred currency only in `add`, never in `update`, and never on dropdown changes.
- Every state change is written through the storage port. Writes save the whole `AppState`; the data is tiny, so there are no per-record writes. Saves run one at a time: each waits for the previous one, and pending saves may be coalesced into the latest state, so an older save can never land after a newer one.
- The service loads from the storage port before the page renders its sections. Until loading finishes, sections don't render, so the empty state never flashes for returning users. If loading or saving fails, the app keeps working in memory for the current visit, logs a warning, and shows a calm, persistent notice (a polite live region) saying that changes will only last for this visit. The notice stays until a later save succeeds.

### Storage port

- A small port with `load(): Promise<AppState | null>` and `save(state: AppState): Promise<void>`. It is the storage test seam. It is an abstract class, used directly as the Angular injection token: the app config provides the IndexedDB adapter for it, and tests provide the in-memory fake instead.
- Production adapter: IndexedDB. One database and one object store, with the whole state under one key, like the prototype. `AppState` carries a `version` number. The adapter validates the loaded shape and version. Absent data means a first visit. Data that is present but unreadable is never overwritten silently: the adapter copies it to a backup key, the app starts empty, and the storage notice explains that saved data couldn't be read.
- Test adapter: an in-memory fake that stores a deep copy of each saved state (so later mutations can't leak into it), can hold a save pending until the test releases it, and can be told to reject loads or saves. A test re-renders the page on the same fake to simulate a reload.
- No new dependencies. The IndexedDB adapter is kept thin and checked by hand in the browser.

### Add form

- Built with Signal Forms and schema-based validation. The same form model and schema are reused for editing.
- Initial values: name empty, price empty, billing frequency blank, currency = preferred currency (blank if none), reason _Essential_.
- On a successful add: create the subscription with estimated usage and `decision: null`; set the preferred currency to its currency; show a "Subscription added" toast; reset name, price and billing to blank; keep reason _Essential_ and currency = preferred currency.
- On validation failure: nothing is added. The first invalid field (in form order) gets a red outline, `aria-invalid="true"`, and focus. A toast just above the Add button shows and announces the error. Each invalid field is also linked by `aria-describedby` to its own visually hidden error text, which stays until the field is valid again. Error toasts stay until the user changes the reported field or another toast replaces them. Duplicate-name copy: _"You already have {existing name}. Add something to tell them apart, like '{existing name} Family'."_
- The muted helper line at the bottom of the add box says usage is estimated from the reason and can be refined in the review.
- Layout (ticket 07b, see agreed-changes §2): one row of five fields on wide screens, two columns under 960px, one column under 560px, at the form's current width. Labels are visually hidden but present (the billing label stays _"Billing frequency"_); placeholders are _"Name e.g. Spotify"_ and _"Price"_ and return when a field is emptied; the blank select options read _"Billing"_ and _"Currency"_; Reason names are not renamed for layout; the heading _"Add a subscription"_ is visually hidden. The submit button is _"Add subscription"_.
- The empty state shows the add form after "Add your first subscription" (progressive disclosure, as in the prototype). With subscriptions present, the add form stays visible under the card list. "Start adding" in the top bar scrolls to the section, reveals the add form if it's still hidden, then focuses the name field.
- When the first subscription is added, the page smoothly scrolls to _See the reality_ and, once the section has rendered, moves focus to its heading (made focusable with `tabindex="-1"`), because the Add button the user activated disappears with the empty state. The scroll respects `prefers-reduced-motion`. Later adds keep focus in the add form's name field.

### Edit and delete

- Selecting a card (a button, keyboard-operable) turns that card into an in-place edit form with the five creation fields.
- Changes apply live: whenever the whole edit form is valid, the subscription is updated and saved, so totals update as the user edits. While any field is invalid, the last valid values stay in effect and the field shows its error.
- A **Done** button closes the edit form. If the form is invalid when Done is pressed, it stays open, the toast shows the error and focus moves to the invalid field. On close, focus returns to the card.
- Editing never changes `decision`, `usageConfirmed` or the preferred currency. Changing the reason re-estimates usage while `usageConfirmed` is false. After that, usage is untouched.
- **Delete** in the edit view opens an inline question on the card (focus moves to it): _"Did you already cancel {name}? Deleting it here doesn't stop the payment."_ with **Yes, delete it** and **Not yet, keep it**. Yes removes the subscription and moves focus to the next card. If none remain, the page is back in the empty state: the add form is revealed there first, then its name field gets focus. Not yet sets the decision to Cancel (usage stays unconfirmed), closes the question and editor, and returns focus to the card.

### Reality section

- Before the first subscription it is shown dimmed, as are the review section and savings card. They are not `inert`: in that state they contain no interactive controls, and their explanatory text ("Add a subscription first", the no-subscriptions insight, zero figures) stays in the accessibility tree. The dimmed styling must still meet WCAG AA contrast, so it can't simply copy the prototype's opacity-based locked look.
- One card per currency, stacked full-width, in first-used order among current subscriptions (lowest `sequence` per currency). If every subscription in a currency is deleted, its card disappears. If that currency is used again, it goes to the end.
- Each card: label, annual total (large), monthly total ("every month"), subscription count, rarely used count, and the before/after comparison ("Before review" = annual total; "If you cancel the ones you no longer value" = annual total − potential savings in that currency).

### Review

- The review shows the first subscription in the queue. The queue position is never saved. In the normal pass, "current" is always the first undecided subscription.
- _Review again_ starts an in-memory pass over all subscriptions in insertion order, with each one's current decision pressed. Deciding advances within that pass. At its end, _Review complete_ shows again. The pass reads the live list, so a subscription added during it appears at the end of that same pass (undecided). A deleted one drops out.
- Selecting a review candidate's name in the insight brings that subscription up in the review card, even if it already has a decision, and moves focus to the review card's heading. After a decision on it, the review goes back to where it was: if a _Review again_ pass is active, the pass continues from its current position; otherwise the normal rule applies (first undecided, or _Review complete_).
- Reason and usage choices save immediately. Changing the reason in the review never re-estimates usage, because the usage question sits right below it and the user answers it directly.
- A decision sets `decision` and `usageConfirmed`, and advances. Focus moves to the next review heading, or to the _Review complete_ heading.
- Reason, usage and decision controls are buttons with `aria-pressed` reflecting the current value. The reason buttons and the usage buttons each sit in a group (`role="group"`) labelled by their question. After a reason or usage choice saves, focus stays on the chosen button.
- The progress bar shows decided / total, with an accessible label (e.g. "3 of 7 reviewed").

### Savings card

- A single dark card with _Potential annual savings_ as one line for each currency that has subscriptions, in the same order as the reality cards, including zero lines (e.g. €0 and $0 when nothing is marked Cancel). With no subscriptions at all, it shows a single neutral zero while the card is dimmed.
- Keep, Unsure and Cancel counts across all currencies.
- Insight box:
  - no subscriptions → "Add your subscriptions first. Your review insights will appear here."
  - subscriptions but no review candidates → "As you review, we'll surface the subscriptions that look least aligned with how you actually use them."
  - review candidates → "You spend {amounts joined with ', ' and ' and '} per year on subscriptions you describe as optional and rarely use." plus a muted line of candidate names separated by " · ", each a button.

### Toast

- One toast component, rendered as a polite live region (`role="status"`). It is centred above the relevant form's submit button, at most 360px wide including padding and border, and fills the available width on narrower screens. Validation errors stay until the user changes the reported field or another toast replaces them. Success toasts ("Subscription added") use the same component and hide after 2.5 seconds. The toast doesn't steal focus.

## Testing Decisions

- A good test drives the app the way a user or caller does and asserts on observable outcomes: rendered text, pressed states, focus, what a reload shows. Tests don't reach into component internals, private signals or template structure beyond accessible roles, labels and text.
- Three seams, in this order of preference:
  1. **Page seam (primary).** Render the root App with TestBed. Provide the in-memory storage fake in place of the IndexedDB adapter, and interact through the DOM: fill the add form, click buttons, open edit, answer the delete question, select insight names. This covers every user story end to end: empty state, add and validation toasts, preferred currency behavior, per-currency reality cards, review order and _Review again_, savings lines and counts, insight copy and name selection, edit/delete flows, dimmed sections with readable text, the storage-failure notice, `aria-pressed` and focus moves.
  2. **Storage seam.** A reload test: seed or save state through the page, destroy the fixture, create a new App on the same in-memory fake, and assert that subscriptions, decisions and the preferred currency come back and the review resumes at the first undecided subscription. Test that quick edits in a row, with the first save held pending, still land in order: release the saves, wait for them to settle, then reload and see the final state. Test that unreadable stored data leads to an empty page with the notice, and that the unreadable data is kept under the backup key. Also test that a failing fake (load or save rejects) leaves the page usable and shows the notice that changes only last for this visit.
  3. **Domain seam.** Direct unit tests on the pure domain module for the rules with many cases: monthly/annual cost, recurring cost per currency and first-used ordering, estimated usage table and re-estimation only while usage is unconfirmed, rarely used, review queue order, potential savings and "after" totals, review candidates, name normalization and uniqueness (including excluding self on rename), price validation (0, negative, 3 decimals), money formatting per currency and decimals (including a tiny non-zero annual amount that must not show as zero), and amount joining for 1/2/3+ currencies.
- The real IndexedDB adapter isn't unit-tested (jsdom has no IndexedDB, and no new dependencies are allowed). Check it by hand in the browser: add, refresh, restart.
- Prior art: the scaffold's root-component spec, which uses TestBed + Vitest + jsdom via `npm test -- --watch=false`. Its placeholder title assertion is replaced by page-seam tests.
- Accessibility: page tests assert roles, accessible names (including the labelled review groups), `aria-pressed`, `aria-invalid` and the persistent `aria-describedby` error text on invalid fields, live-region presence, and focus targets (after the first add, after deleting the last subscription, after review choices and decisions).
- Accessibility gate (repeatable, manual, no new npm dependency): run axe in the browser (DevTools or the axe extension) and get zero violations, including contrast, on each of these states: empty page; one currency; several currencies; review in progress; review complete; edit open with an invalid field; delete question open; insight with review candidates; storage-failure notice showing.

## Out of Scope

- Authentication, backend, sync across devices.
- Bank connections and automatic subscription detection.
- Currency conversion, and one combined total in a chosen currency (listed under _Later_ in agreed-changes).
- Payments, notifications, AI, complex analytics, charts, social sharing.
- Routing or multiple pages.
- Insight rules other than the review candidate rule.
- A usage field on the add form.
- Undoing a review decision back to undecided.
- Import/export of data.

## Further Notes

The agreed documents leave these points open. The spec settles them as below, after two review rounds with Codex (debate lane) and the owner's ruling on annual rounding:

1. **Reason change in the review** never re-estimates usage. Only the edit form does, and only while `usageConfirmed` is false.
2. **Usage confirmation is stored** as `usageConfirmed` and set only by a decision in the review. _Not yet, keep it_ sets Cancel without confirming usage.
3. **Edits apply live** whenever the whole edit form is valid. There is no "discard changes". **Done** closes the form and is blocked while the form is invalid.
4. **Currency card order** is first-used among _current_ subscriptions. Deleting every subscription in a currency drops its card, and reusing that currency later puts its card at the end.
5. **Before the first subscription**, the reality section, the review section and the savings card are dimmed, not `inert`. Their text stays readable to screen readers and meets AA contrast.
6. **Insight name selection** can bring up an already-decided subscription. After the next decision, the review goes back to where it was: an active _Review again_ pass continues from its position, otherwise the first undecided one.
7. **Amount joining** for 3+ currencies uses commas and a final "and": "€120, $60 and £40".
8. **Duplicate-name toast** uses the existing subscription's name in both places ("You already have Netflix. … like 'Netflix Family'.").
9. **Zero savings** shows one zero line for each currency that has subscriptions.
10. **Annual rounding** uses whole units, except that a non-zero amount that would round to zero shows cents (decided by the owner).
11. **Review again** reads the live list: a subscription added mid-pass appears at the end of the same pass.
12. **Storage failure** shows a persistent notice that changes only last for this visit.
13. **Unreadable stored data** is copied to a backup key, the app starts empty, and the storage notice explains what happened.
14. **Focus after structural changes:** the first add focuses the _See the reality_ heading; deleting the last subscription reveals the add form and focuses its name field.

The prototype stores `usage: "Monthly"` by default, updates the preferred currency on dropdown change, defaults the currency to EUR and uses `maybe`. All four are superseded by agreed-changes and this spec.
