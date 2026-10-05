# 21: Insight

Status: resolved
Lane: feature
Blocked by: 20
Test seam: Page seam; domain seam for review candidates and amount joining
Spec: `.scratch/mvp/spec.md` › User Stories 69–70, 72–73; Implementation Decisions › Savings card (insight box), Domain module (review candidates, joining amounts); Further Notes 7

## What to build

The insight box in the savings card has three states:
- no subscriptions: "Add your subscriptions first. Your review insights will appear here." (already shown dimmed since ticket 04)
- subscriptions but no **Review candidates**: "As you review, we'll surface the subscriptions that look least aligned with how you actually use them."
- review candidates (reason Nice to Have, Convenience or Occasional Use, and usage Rarely or Almost Never): "You spend {amounts} per year on subscriptions you describe as optional and rarely use." Amounts are the candidates' annual cost per currency, joined as "A", "A and B", "A, B and C". Below it is a muted line of candidate names separated by " · ".

In this ticket the names are plain text. Making them buttons is ticket 22.

## Acceptance criteria

- [x] With one Essential/Daily subscription, the placeholder "As you review, …" shows.
- [x] Adding an Occasional Use subscription (estimated Rarely) at €10/month shows "You spend €120 per year on subscriptions you describe as optional and rarely use." and its name below.
- [x] Candidates in EUR and USD show "€120 and $60"; three currencies show "€120, $60 and £40".
- [x] Changing a candidate's usage to Weekly in the review removes it from the insight at once.
- [x] Domain tests: candidate rule (all reason/usage combinations that qualify and some that don't); joining for 1, 2 and 3+ amounts.
- [x] `npm run build` and `npm test -- --watch=false` pass.
