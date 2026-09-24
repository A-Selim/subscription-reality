# Agreed changes

Decisions reached after the original [`project-brief.md`](project-brief.md), from the design discussion on 2026-09-24. The brief is kept unchanged as the starting point. **Where this file, the brief, and the prototype disagree, this file wins.**

Sections follow the brief's numbering. Each change carries a one-line reason. Terms are defined in [`CONTEXT.md`](../CONTEXT.md).

---

## Page structure (new)

- The app is one scrolling page, as in the prototype: hero, _Your recurring life_, _See the reality_, then the review next to the savings card. It has no router. See [ADR 0001](adr/0001-single-page-no-routing.md).
  - _Why:_ the brief asks for no dashboard navigation, and the flow reads as one story.

## 2. Subscription: the add form

- **Fields:** name, price, billing frequency, currency and reason. The form has **no usage field**.
  - _Why:_ a short form lets people add subscriptions quickly. The review collects the detail.
- **Required:** name, price, billing frequency and currency.
- **Billing frequency** starts blank on every new subscription.
  - _Why:_ it changes from one subscription to the next, and a blank required field avoids carrying over a wrong value.
- **Reason** is pre-selected as _Essential_. The user refines it in the review.
- **Usage** is estimated from the reason (see §5). A small, centred line of muted text at the bottom of the add box says so.
- **Name** is trimmed, required, at most 40 characters, and **unique**, compared ignoring case and surrounding spaces (`netflix ` clashes with `Netflix`). Price, billing and currency don't count. Renaming an existing subscription to a taken name is blocked too.
  - _Why:_ two accounts for the same service are told apart by name, e.g. _Netflix_ and _Netflix Family_.
- **Price** must be greater than 0, with at most 2 decimal places.
- **Validation errors** show as a toast just above the form's Add button, not in the bottom-right corner. The invalid field gets a red outline and receives focus, and screen readers announce the toast. Duplicate example: _"You already have Netflix. Add something to tell them apart, like 'Netflix Family'."_
  - _Why:_ the error appears where the user is already looking, and it's accessible.

## 3. Currency

- The currency field starts **blank** until the user's first pick. After that, it starts on the **preferred currency**: the currency of the most recently _created_ subscription.
- Editing a subscription never changes the preferred currency.
  - _Why:_ correcting an old entry shouldn't change the default for the next new one.
- Totals are never combined. Each currency gets its own card (see §6).

## 5. Usage

- A new subscription's usage is **estimated from its reason**:

  | Reason          | Estimated usage |
  | --------------- | --------------- |
  | Essential       | Daily           |
  | High Value      | Daily           |
  | Work / Learning | Daily           |
  | Convenience     | Weekly          |
  | Nice to Have    | Monthly         |
  | Occasional Use  | Rarely          |

  _Almost Never_ is never estimated; only the user can choose it.

- Usage is **confirmed** the first time the user makes a review decision on that subscription.
- Changing the reason while editing updates the estimated usage. After confirmation, it never does.
- Cards show usage the same way whether it's estimated or confirmed.
- This replaces the prototype's hidden `usage: "Monthly"` default.

## 6. Subscription reality

- _See the reality_ shows **one card per currency**, stacked full-width in the order each currency was first used. Each card follows the prototype's reality card:
  - annual total (big)
  - monthly total
  - number of subscriptions in that currency
  - number of rarely used subscriptions in that currency
  - before/after comparison
- With one currency there is one card, which looks exactly like the prototype.
- This replaces the brief's `€420/year + $180/year` single line.
  - _Why:_ it stays readable with 3–4 currencies and on phones.
- Subscriptions marked **Cancel** stay in the totals, because the user still pays for them until they actually cancel. They count toward _Potential savings_ and the "after" amount.
- **Rarely used** counts usage _Rarely_ or _Almost Never_, whether estimated or confirmed.

## 7. Review experience

- **Order:** undecided subscriptions first, in the order they were added. The position isn't saved: the next subscription is always the first undecided one.
- The reason and usage questions open with the current values selected.
- Choosing Keep, Unsure or Cancel records the decision, confirms the usage and moves to the next subscription. Choosing Cancel shows no extra message.
- When no undecided subscriptions remain, _Review complete_ offers **Review again**, which goes through every subscription with its current decision selected.
- A subscription added after the review finished joins the queue as undecided.

## 8. Potential savings

- The dark savings card stays a single card. _Potential savings_ shows **one line per currency**.
- The Keep, Unsure and Cancel counts cover all currencies together.
- _Unsure_ appears only as a count.

## 9. Simple insights

- The only rule is the brief's **review candidate** rule. No other rules for the MVP.
- It appears in the existing insight box on the savings card:
  - one sentence, with the currency amounts joined: _"You spend €120 and $60 per year on subscriptions you describe as optional and rarely use."_
  - below it, one muted line of names: _Adobe · Headspace · Audible_. Selecting a name brings that subscription up in the review.
- With no review candidates, the box shows the prototype's placeholder text.
  - _Why:_ a total with no names doesn't point the user at any subscription. The names line adds very little to the screen.

## 11. CRUD

- **Edit:** selecting a card opens it in place, showing the fields entered at creation (name, price, billing, currency and reason). Totals update as the user edits.
- Editing keeps the review decision.
- **Delete** asks _"Did you already cancel {name}? Deleting it here doesn't stop the payment."_
  - **Yes, delete it:** removes the subscription.
  - **Not yet, keep it:** keeps it and sets its decision to _Cancel_, so it counts toward potential savings.
  - _Why:_ deleting from the app doesn't cancel the real subscription.

---

## Later (out of MVP scope)

- **One total in a chosen currency:** let the user pick a currency and show every total converted into it. This needs exchange rates, and the source is still open. The brief lists currency conversion as out of scope for the MVP.
