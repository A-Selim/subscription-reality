@AGENTS.md

## Claude's role in this project

- You plan and review. Codex writes the implementation code.
- When reviewing: check against `docs/project-brief.md` and the rules above.
  Flag bugs, missing requirements, and Angular anti-patterns.

## Agent skills

### Issue tracker

Issues are local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
