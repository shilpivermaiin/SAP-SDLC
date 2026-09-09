---
description: 'Phase 4 — Technical Design. Generates a Technical Specification (TS) covering every RICEFW object for the requirement, from the Functional Spec (from /FunctionalSpec) and Solution Architect write-up (from /SolutionArchitect). Final step in the design chain before Build.'
---

# TechnicalSpec — SAP Technical Specification Generator (Phase 4: Technical Design)

```
/Scope  →  /SolutionArchitect  →  /FunctionalSpec  →  /TechnicalSpec  →  /Code
```

**Uses skill:** [.claude/skills/technical-spec/SKILL.md](../skills/technical-spec/SKILL.md) — **read it in full before doing anything else.** It holds the complete Purpose, Boundary Rule, Cross-Cutting Concerns, Workflow (Entry Criteria/Config Review/Reuse Assessment, Source Discovery, Context Pull, Ask the User groups including the mandatory Clean Core assessment, Freeze Confirmation, Save to Artifacts), Output Format template, and Guardrails Summary for this phase.

## Hard Gate — Document Must Exist (mandatory)
Never suggest or allow proceeding to `/Code` unless `TechnicalSpec_<ObjectID>.md` has been frozen and saved (see skill's Freeze Confirmation and Save to Artifacts steps). If the user asks to move on before that, stop and ask: **"No Technical Spec has been finalized yet for this object. Should I complete and save it now before proceeding? (yes/no)"** — Yes → run the skill's steps to produce it; No → stay blocked at this phase.

**Gate to next phase:** TS frozen and saved (Freeze Confirmation, Step 5).
