---
description: 'Phase 3 — Functional Design. Generates a Functional Specification (FS) covering every RICEFW object for the requirement, from the Solution Architect write-up (from /SolutionArchitect) and BRD (from /Scope). Sits between /SolutionArchitect and /TechnicalSpec.'
---

# FunctionalSpec — SAP Functional Specification Generator (Phase 3: Functional Design)

```
/Scope  →  /SolutionArchitect  →  /FunctionalSpec  →  /TechnicalSpec
```

**Uses skill:** [.claude/skills/functional-spec/SKILL.md](../skills/functional-spec/SKILL.md) — **read it in full before doing anything else.** It holds the complete Purpose, Boundary Rule, Cross-Cutting Concerns, Workflow (Entry Criteria & Reuse Assessment, Source Discovery, Context Pull, Ask the User groups, Freeze Confirmation, Save to Artifacts), Output Format template, and Guardrails Summary for this phase.

## Hard Gate — Document Must Exist (mandatory)
Never suggest or allow proceeding to `/TechnicalSpec` unless `FunctionalSpec_<ObjectID>.md` has been frozen and saved (see skill's Freeze Confirmation and Save to Artifacts steps). If the user asks to move on before that, stop and ask: **"No Functional Spec has been finalized yet for this object. Should I complete and save it now before proceeding? (yes/no)"** — Yes → run the skill's steps to produce it; No → stay blocked at this phase.

**Gate to next phase:** FS frozen and saved (Freeze Confirmation, Step 5).
