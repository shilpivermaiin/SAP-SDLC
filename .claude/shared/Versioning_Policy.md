# Versioning Policy

Governs how artifacts are versioned, frozen, and gated across phases.

## Version History table

Every artifact includes, below its main body, a **Version History** table:

| Version | Date | Author | Change Summary |
|---|---|---|---|
| v1.0 | YYYY-MM-DD | <name/email> | Initial draft |

Every subsequent edit — including a Cross-Phase Change Propagation update —
appends a new row. Never delete or overwrite a prior row.

## Sign-off & Freeze Status

A separate section, **after** Version History, and **never** a row inside
the Document Control table:

```markdown
## Sign-off & Freeze Status

**Status:** Draft
**Frozen On:** —
**Approved By:** —
```

- While `Status: Draft`, the artifact may be edited freely by its own
  phase.
- The user freezes an artifact by explicitly confirming it's approved (a
  phase skill asks for this confirmation once its draft is complete). On
  confirmation, update this section to:

```markdown
**Status:** Frozen
**Frozen On:** YYYY-MM-DD
**Approved By:** <name/email>
```

## Hard Gate

Before a phase produces any output, its skill reads the single upstream
artifact and checks its Sign-off & Freeze Status section:
- `Status: Frozen` → proceed.
- `Status: Draft` or the artifact doesn't exist → stop, and tell the user
  plainly which artifact must be completed and frozen first. This check
  blocks progress; it is not a skippable clarifying question.

## Version 2 check

If the user asks to change an artifact whose Sign-off status is already
`Frozen`, **outside** of an already-confirmed Cross-Phase Change
Propagation flow:
1. Confirm with the user that they intend to reopen a frozen, signed-off
   artifact (this is distinct from routine phase work).
2. On confirmation: bump the version (e.g. v1.0 → v2.0), append a Version
   History row describing the change and why, edit the artifact in place,
   and reset Sign-off & Freeze Status to `Draft` until re-approved.
3. Re-freeze following the normal Sign-off procedure above once the user
   confirms the update is correct.
4. If any downstream artifacts already exist for this requirement, apply
   Governance Principle 9a (Cross-Phase Change Propagation) — confirm which
   of them also need updating before touching them.
