# Execution Logging

Best-effort operational logging for the framework. Logging never blocks a
phase — if a write target isn't available, skip that log silently and
continue.

## `execution/{req-id}/`

One folder per Requirement ID, created at `/Scope` onboarding. Holds:
- `clarifications_<Phase>.md` — one per phase, per `clarify.md`'s
  transcript format.
- `profile.md` — the requirement's running profile: Requirement ID, Name,
  module area, requester, and a phase-by-phase status line updated as each
  phase completes (e.g. `Scope: Frozen v1.0 — 2026-09-16`).

## `.sapsdlc/logs/`

Audit trail across all requirements. One append-only file per calendar
month: `.sapsdlc/logs/YYYY-MM.md`. Each phase invocation appends one line:

```
YYYY-MM-DD HH:MM UTC | REQ-#### | <Phase> | <action> | <artifact path or note>
```

Examples of `<action>`: `phase-start`, `hard-gate-pass`, `hard-gate-block`,
`artifact-saved`, `artifact-frozen`, `version-2-check`,
`cross-phase-propagation`.
