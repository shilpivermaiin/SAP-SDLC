---
description: 'Phase 2 — SAP Solution Approach write-up. Bridge between /Scope and /FunctionalSpec. Reviews the BRD and decides how the need will be solved at a system/approach level (fit-gap, RICEFW classification, approach, prerequisites) — not detailed logic yet.'
---

# SolutionArchitect — SAP Solution Approach Write-up (Phase 2: Solution Architecture)

```
/Scope  →  /SolutionArchitect  →  /FunctionalSpec  →  /TechnicalSpec  →  /Code  →  /Testing
```

**Uses skill:** [.claude/skills/solution-architect/SKILL.md](../skills/solution-architect/SKILL.md) — **read it in full before doing anything else.** It holds the complete Purpose & Role, Boundary Rule, Architecture Approach Rules (including the mandatory neutral-tone rule — never attribute an approach choice to team/individual skill or competency), Cross-Cutting Concerns, Workflow (BRD Discovery, Clarification Questionnaire, Solution Approach Options, What Will Be Built with an accompanying architecture diagram, Prerequisites, Validation, Finalization, Post-Save Confirmation & Architecture Sign-off), Output Format template, and Writing Guidelines for this phase.

## Hard Gate — Document Must Exist (mandatory)
Never suggest or allow proceeding to `/FunctionalSpec` unless `SolutionArchitect_<name>.md` has been saved in `Artifacts/` and agreed in the skill's Post-Save Confirmation & Architecture Sign-off Step. If the user asks to move on before that, stop and ask: **"No Solution Architect write-up has been finalized yet. Should I complete and save it now before proceeding? (yes/no)"** — Yes → run the skill's steps to produce it; No → stay blocked at this phase.

**Gate to next phase:** Write-up frozen and signed off by Solution Architect + Technical Lead before proceeding to `/FunctionalSpec`.
