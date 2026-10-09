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
- **Layout: a compact form, as in the prototype.** On wide screens the five fields sit in **one row** (name, price, billing frequency, currency, reason) with the submit button below it, then the muted helper line. The form keeps its current width. It becomes two columns under 960px (higher than the prototype's 820px, so long select text isn't clipped) and one column under 560px. Field styling follows the prototype (16px radius, 10px gap), with two accessibility exceptions: focus on a field shows as a solid 2px `--accent` border with no outline gap (the border turns accent and gets a 1px inset accent shadow, with a transparent outline so forced-colors mode still shows one), which must stay clearly visible, and the field border is a darker gray (`#8a8a84`, about 3.5:1 on white) instead of the prototype's faint `--line`, because with no visible labels the border is the only cue for a field's edge (WCAG 1.4.11 needs 3:1). A select showing its blank option ("Billing", "Currency") uses the muted text colour, like the placeholders. Selects and inputs reset their native `appearance` (with a custom chevron on the selects) so Safari on macOS and iOS honour the height, radius and padding; the Price field hides its spinner arrows; controls use a 16px font floor so iOS Safari does not zoom on focus. The five fields and the submit button share one control height of **45px** (a single `--control-height`, applied as `min-height` so the controls still grow with larger text or zoom; 45px also clears the 44px touch-target guideline).
  - **No visible labels.** Every field keeps a real `<label>`, visually hidden, so its accessible name never depends on the placeholder. Placeholders show while a field is empty and come back when the user erases what they typed: name _"Name e.g. Spotify"_, price _"Price"_. The blank options of the two selects read _"Billing"_ and _"Currency"_ (short enough for the row; the values stay blank, as agreed above, and the hidden label still says _"Billing frequency"_). Reason names are never renamed for layout: _Work / Learning_ is a domain term and a stored value. If a long Reason is clipped after the layout is built, the owner decides from the browser (options: tune column weights, or shorten the display text only). The form's heading _"Add a subscription"_ is visually hidden but stays in the page, so the form keeps its accessible name.
  - The submit button is called **Add subscription** (was _Add_). Wherever these docs say "the Add button", they mean this button.
  - _Why:_ the first build used a large two-column grid with stacked labels, which felt heavy for a five-field form. The prototype's single row is quicker to fill. The prototype's placeholder-only fields would fail WCAG, so labels stay, hidden.
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

## Storage (new)

Decided on 2026-09-30, after ticket 09 and the research in [`research/browser-storage.md`](research/browser-storage.md).

- **Keep IndexedDB.** No browser storage can guarantee 100% that data is kept: the browser or the user can clear it, and private windows drop it. localStorage follows the same rules and adds nothing.
  - _Why:_ switching APIs would not make saving safer, and IndexedDB is already built.
- **Saving is never blocked after a failed load.** The app keeps saving, so the user's work in this visit is not lost. The one exception stays: if unreadable data can't be copied to the backup key, saves stop for that visit, so the unreadable data is never overwritten without a copy.
  - _Why:_ blocking saves would lose everything the user does in that visit, to protect against a very rare browser error.
- **Two storage notices, which can show together:**
  - _Couldn't be read_: shown when saved data is unreadable. It stays for the whole visit, because a later save doesn't bring the old data back.
  - _Only for this visit_: shown when a load or a save fails. It goes away when a later save succeeds.
- **Ask the browser to keep the data.** After the first successful save of a visit, the app calls `navigator.storage.persist()` once, unless the data is already persisted. It doesn't call it on page load, because Firefox shows a permission prompt. A refusal is normal and shows no notice.
  - _Why:_ it stops the browser from clearing the data automatically when disk space is low. It doesn't stop the user from clearing it.

---

## Later (out of MVP scope)

- **One total in a chosen currency:** let the user pick a currency and show every total converted into it. This needs exchange rates, and the source is still open. The brief lists currency conversion as out of scope for the MVP.
- **Export and import a JSON file:** let the user download their data as a file and load it back. It's the only way, with no server, to keep a copy that survives clearing site data. The UI and the logic (merge or replace, validation, where the buttons go) still need a discussion. Tracked as ticket 36, at the end of the project.
