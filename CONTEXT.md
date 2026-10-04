# Subscription Reality

A personal, on-device tool for seeing what recurring payments really cost per year and deciding which ones still deserve to stay.

## Language

### Subscriptions

**Subscription**:
A recurring payment the user has entered, with a name, price, billing frequency, currency, reason and usage. Its name is unique, ignoring case and surrounding spaces.
_Avoid_: Service, payment, item

**Billing frequency**:
How often the subscription's price is charged: monthly or yearly.
_Avoid_: Billing, period, cycle

**Reason**:
Why the user says they keep a subscription (Essential, High Value, Convenience, Nice to Have, Occasional Use, Work / Learning).
_Avoid_: Category, tag, type

**Usage**:
How often the user says they actually use a subscription (Daily, Weekly, Monthly, Rarely, Almost Never). Estimated from the reason when a subscription is added, then confirmed or corrected by the user in a review.
_Avoid_: Frequency (ambiguous with billing frequency), activity

**Preferred currency**:
The currency most recently chosen when adding a subscription, pre-selected for the next one. There is none until the user makes a first choice.
_Avoid_: Default currency, base currency

### Costs

**Monthly cost** / **Annual cost**:
A subscription's price expressed per month or per year, whatever its billing frequency.
_Avoid_: Yearly price, normalized price

**Recurring cost**:
The sum of all subscriptions' monthly or annual cost, kept separate per currency and never converted.
_Avoid_: Total spend, balance

**Rarely used**:
A subscription whose usage is Rarely or Almost Never.
_Avoid_: Unused, inactive

### Review

**Review**:
Going through subscriptions one at a time to reconfirm reason and usage and record a review decision.
_Avoid_: Audit, cleanup

**Review decision**:
The user's verdict on a subscription: Keep, Unsure or Cancel. A subscription without one is undecided.
_Avoid_: Status, mark, Maybe (for Unsure)

**Review again pass**:
A second walk through every subscription in the order added, started from _Review complete_, showing each one's current review decision. It lives only in memory and reads the live list.
_Avoid_: Re-review, second review

**Cancel** (decision):
The user's intent to stop paying for a subscription. The subscription stays in the list and in recurring cost until the user deletes it.
_Avoid_: Cancelled, removed

**Delete**:
Removing a subscription from the app, normally once the user has actually cancelled it with the provider. Unrelated to the Cancel decision.
_Avoid_: Remove, cancel

**Potential savings**:
The annual cost of all subscriptions with the Cancel decision, per currency.
_Avoid_: Savings, saved

**Review candidate**:
A subscription whose reason is Nice to Have, Convenience or Occasional Use and whose usage is Rarely or Almost Never.
_Avoid_: Wasteful subscription, flagged

### Storage

**Storage notice**:
A calm, persistent message at the top of the page about saving. It has two kinds, which can show together: _Couldn't be read_ (the saved data is unreadable; it stays for the whole visit) and _Only for this visit_ (a load or a save failed; it goes away when a later save succeeds).
_Avoid_: Error, alert, warning, toast

**Unreadable data**:
Saved data that is present but has the wrong shape or version, so the app can't use it. It is never overwritten without a backup copy.
_Avoid_: Corrupt data, invalid data

**Backup copy**:
The unchanged copy of unreadable data, kept in the browser under a separate key before the app starts empty. The app can't restore it.
_Avoid_: Export, snapshot
