# 40: Edit saves only when Done is pressed

Status: ready-for-agent
Lane: feature
Blocked by: none
Test seam: Page seam (migrate the edit dialog tests from ticket 33)
Spec: Owner decision (2026-10-09). `docs/agreed-changes.md` › 11; spec story 74 and edit decisions. Replaces ticket 33's "Saving stays live" and undo-on-close rules.

## What to build

Today `EditSubscriptionForm` applies and saves every valid change while the user types, and restores a snapshot when the dialog closes with an invalid field. Replace this with a draft:

- Typing changes only the form's draft. Nothing is applied to the state or saved, and the totals don't move.
- **Done** with a valid form applies only the changed fields (`state.edit`), saves, and closes. With an invalid form, behaviour is unchanged: it stays open, shows the error toast, focuses the first invalid field.
- **Close** and **Escape** (and the backdrop click from ticket 41) close and discard the draft. No save.
- Remove the live-apply effect, the snapshot, and the restore-on-destroy logic.
- The hint becomes: "Changes save when you press Done."
- The dialog's annual-cost text previews the draft when the draft is valid, otherwise it shows the saved value. (Ticket 42 moves it into the header; keep the preview logic here.)
- Ticket 30's rules stay: editing never changes the Review decision, `usageConfirmed` or the Preferred currency; changing the reason re-estimates usage only while usage is unconfirmed, applied on Done.

## Acceptance criteria

- [ ] Changing the price to a valid value doesn't change the totals or save until Done is pressed. After Done, both update and a reload shows the new price.
- [ ] Change the price, then press Close (and separately Escape): the dialog closes, nothing changed, nothing saved.
- [ ] Done with an invalid field keeps the dialog open, shows the toast and focuses the first invalid field.
- [ ] Reopening shows saved values with no errors.
- [ ] The hint reads "Changes save when you press Done."
- [ ] Every close returns focus to the card button.
- [ ] Ticket 30's rules still hold.
- [ ] The live-save and restore-on-close tests are replaced, not just deleted.
- [ ] `npm run build` and `npm test -- --watch=false` pass.
