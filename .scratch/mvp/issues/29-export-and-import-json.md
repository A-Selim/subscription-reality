# 29: Export and import a JSON file

Status: needs-info
Blocked by: 28
Spec: `docs/agreed-changes.md` › Later (Export and import a JSON file); research in `docs/research/browser-storage.md` (section on options beyond browser storage)

## Why

No browser storage can guarantee that data is kept. The browser or the user can clear it. Letting the user download their data as a JSON file, and load it back, is the only way with no server to keep a copy that survives clearing site data. It needs no new dependency.

## Open questions (discuss UI and logic before building)

- Where do the Export and Import actions go on the page, and how do they look next to the prototype?
- Import: does it replace the current list, or merge with it? If it merges, how are duplicate names, order, review decisions and the preferred currency handled?
- How does import validate the file (shape and version), and what does the user see when the file is invalid?
- Does import ask for confirmation before it replaces data?
- What is the file name and format (for example the saved `AppState` with its `version`)?
- Should the storage notices point the user to Export?

## What to build

To be written after the discussion. Then set `Status: ready-for-agent` and add a `Lane:` line.
