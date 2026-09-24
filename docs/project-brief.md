# Subscription Reality

## Goal

Build a small consumer web app that helps people understand how much they spend on subscriptions and whether those subscriptions are still worth keeping.

The experience should feel simple and natural, not like a dashboard or finance tool.

The main idea is:

> Small monthly payments feel cheap. Annual recurring spending often tells a different story.

---

## Core User Flow

1. User opens the app with an empty state.
2. User starts adding subscriptions.
3. The app shows monthly and yearly cost.
4. User reviews each subscription.
5. User explains:
   - why they keep it
   - how often they use it
6. User decides:
   - Keep
   - Unsure
   - Cancel
7. The app shows potential annual savings.

---

# 1. Empty State

The app should start empty.

The main section is:

## Your recurring life

Motivate the user to start adding subscriptions.

Example copy:

> What are you paying for every month?

> Most people underestimate how many recurring payments they have. Add your first subscription and start building the full picture.

Show examples such as:

- Streaming
- AI tools
- Cloud storage
- Gym
- News
- Software

Primary action:

**Add your first subscription**

---

# 2. Subscription

A subscription should contain:

- Name
- Price
- Billing frequency
- Currency
- Reason
- Usage frequency
- Review decision

### Billing frequency

Support:

- Monthly
- Yearly

The app should calculate both monthly and annual values automatically.

---

# 3. Currency

Support:

- EUR
- USD
- GBP
- EGP

When the user selects a currency for a subscription, remember that selection.

The next subscription should automatically use the same currency.

The user can still change it at any time.

If the user has subscriptions in different currencies, do not automatically combine them using fake exchange rates.

Example:

> €420/year + $180/year

instead of converting them automatically.

---

# 4. Why Do I Have This Subscription?

Each subscription should have a reason.

Suggested options:

- Essential
- High Value
- Convenience
- Nice to Have
- Occasional Use
- Work / Learning

This should help the user reflect on why they are still paying for it.

---

# 5. Usage Frequency

Each subscription should also have usage frequency.

Suggested options:

- Daily
- Weekly
- Monthly
- Rarely
- Almost Never

Reason and usage are separate.

Example:

**Spotify**

Reason: High Value

Usage: Daily

vs.

**Adobe**

Reason: Occasional Use

Usage: Rarely

---

# 6. Subscription Reality

Once subscriptions are added, show the bigger picture.

Main numbers:

- Monthly recurring cost
- Annual recurring cost
- Number of subscriptions
- Number of rarely used subscriptions

Example:

> €127.42/month

becomes:

> €1,529/year

The annual amount should be visually prominent.

---

# 7. Review Experience

The review should happen one subscription at a time.

For each subscription show:

- Name
- Monthly cost
- Annual cost
- Reason
- Usage frequency

Then ask:

## Why do you still have it?

Allow changing the reason.

Then:

## How often do you actually use it?

Allow changing the frequency.

Finally:

- ❤️ Keep
- 🤔 Unsure
- ✂️ Cancel

After choosing, move to the next subscription.

---

# 8. Potential Savings

Subscriptions marked as **Cancel** should immediately contribute to potential savings.

Example:

> Potential savings
>
> €612/year

Also show:

- Keep count
- Unsure count
- Cancel count

---

# 9. Simple Insights

The app can generate basic rule-based insights.

No AI is needed.

Example:

> You spend €486/year on subscriptions that you describe as optional and rarely use.

Useful combinations include:

### Review candidates

Reason:

- Nice to Have
- Convenience
- Occasional Use

and usage:

- Rarely
- Almost Never

These should be surfaced as subscriptions worth reconsidering.

---

# 10. Data Storage

Use **IndexedDB** for browser persistence.

There is no backend in the MVP.

Store:

- subscriptions
- price
- billing frequency
- currency
- reason
- usage
- Keep / Unsure / Cancel decision
- preferred currency

The data should survive:

- page refresh
- browser restart
- reopening the app

Data stays on the user's device.

---

# 11. CRUD

Users should be able to:

- Create subscription
- Edit subscription
- Delete subscription
- Review subscription

Editing any price or billing frequency should immediately update totals.

---

# 12. UX Direction

The app should feel like a lightweight consumer product.

Avoid:

- dashboard navigation
- large tables
- admin-style screens
- complex menus
- unnecessary charts
- signup/login

Prefer:

- large typography
- simple cards
- progressive disclosure
- inline actions
- smooth transitions
- one clear action at a time

The experience should feel reflective rather than financial or analytical.

---

# MVP Scope

## Include

- Empty state
- Add subscription
- Edit subscription
- Delete subscription
- Monthly/yearly billing
- EUR / USD / GBP / EGP
- Remember selected currency
- Reason tags
- Usage frequency
- Monthly totals
- Annual totals
- Review flow
- Keep / Unsure / Cancel
- Potential savings
- Basic insights
- IndexedDB persistence
- Responsive design

## Do Not Include

- Authentication
- Backend
- Bank connections
- Automatic subscription detection
- Currency conversion
- Payments
- Notifications
- AI
- Complex analytics
- Social sharing

---

# Prototype

Use the attached HTML prototype in `./prototype/index.html` as the visual and interaction reference. Pick the technology you want to work with.

The prototype is intended to communicate:

- layout direction
- empty state
- adding subscriptions
- recurring-life section
- review flow
- currency behavior
- overall product feeling

The implementation does not need to copy the HTML structure exactly, but the final experience should stay close to the prototype.
