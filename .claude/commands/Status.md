---
description: 'Utility: read-only cross-phase project status dashboard. Not part of the /Scope → /Testing gate chain — shows what has been done, what is in progress, and what is next for every requirement in Artifacts/.'
---

# Status — SAP-SDLC Project Status Dashboard (Utility, not a lifecycle phase)

```
/Scope → /SolutionArchitect → /FunctionalSpec → /TechnicalSpec → /Code → /Testing
                         ↑
                 /Status reports on all of the above, at any time, without advancing any of them
```

**Uses skill:** [.claude/skills/status/SKILL.md](../skills/status/SKILL.md) — **read it in full before doing anything else.** It holds the complete Workflow (GitHub sync, requirement discovery, cross-phase linkage by Requirement ID, per-phase status determination, "last worked on" enrichment) and Output Format for the dashboard.

## No Hard Gate — this command has none
`/Status` is a read-only reporting utility, not a lifecycle phase. It never requires an upstream artifact to be frozen, never blocks on anything, and never itself blocks any other command. It also has no onboarding role-check and asks no clarifying questions — it only reads and reports what already exists.

## Auto-trigger (in addition to the explicit command)
Treat any plain-language status/progress question the same as an explicit `/Status` invocation — do not wait for the user to type the command. See the skill's "When This Fires" section for the exact trigger phrases (e.g. "what's the status", "where do things stand", "what's been completed so far", "where should I pick this up").
