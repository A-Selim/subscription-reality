# 45: Cancelled subscriptions are not review candidates

Status: resolved
Lane: small
Blocked by: none
Test seam: Domain seam (`isReviewCandidate`) and Page seam (insight)
Spec: Owner decision (2026-10-09). `CONTEXT.md` › Review candidate; `docs/agreed-changes.md` › 9; spec story 69.

## What to build

Today a subscription the user marked **Cancel** still shows in the insight ("You spend … on subscriptions you describe as optional and rarely use" and its name pills). It shouldn't, because the user has already acted on it.

Change the rule in one place, `isReviewCandidate` in `domain/subscription.ts`: a subscription with the Cancel decision is not a review candidate. Undecided, Keep and Unsure ones still are. The insight amount and the pills then follow on their own. When no candidates are left, the insight shows the usual placeholder ("As you review, we'll surface…").

## Acceptance criteria

- [x] Marking a review candidate Cancel removes its pill and its cost from the insight amount.
- [x] Keep, Unsure and undecided candidates still appear.
- [x] Changing the decision from Cancel to Keep or Unsure (Review again) brings it back.
- [x] With every candidate cancelled, the insight shows the placeholder.
- [x] Potential savings, decision counts and Rarely used counts don't change.
- [x] `npm run build` and `npm test -- --watch=false` pass.

## Comments

- Updated the shared Review candidate rule to exclude the Cancel decision. Insight pills and amounts now follow the rule automatically; targeted domain and page tests cover cancellation, Review again, the placeholder, and unaffected counts.
