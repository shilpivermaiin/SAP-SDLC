---
description: 'Phase 6 — Testing. Executes Component Test, SIT, String/Cycle, UAT, Regression, Performance, and Security testing for the object built in /Code, and produces a Test Document. Gate before Deployment/Go-Live.'
---

# Testing — SAP Testing Phase Assistant (Phase 6: Testing)

```
/Scope  →  /SolutionArchitect  →  /FunctionalSpec  →  /TechnicalSpec  →  /Code  →  /Testing  →  Deployment/Go-Live
```

**Uses skill:** [.claude/skills/testing/SKILL.md](../skills/testing/SKILL.md) — **read it in full before doing anything else.** It holds the complete Purpose, Boundary Rule, Cross-Cutting Concerns, Workflow (Entry Criteria & Test Environment Setup, Source Discovery, Context Pull, Component Test & Review, Ask the User groups, Execute Test Cycles, Freeze Confirmation, Save to Artifacts), Output Format template, and Guardrails Summary for this phase.

## Hard Gate — Document Must Exist (mandatory)
Never suggest or allow proceeding to Deployment/Go-Live unless `Test_Document.md` has been frozen and saved (see skill's Freeze Confirmation and Save to Artifacts steps). If the user asks to move on before that, stop and ask: **"No Test Document has been finalized yet for this object. Should I complete and save it now before proceeding? (yes/no)"** — Yes → run the skill's steps to produce it; No → stay blocked at this phase.

**Gate to next phase:** UAT sign-off obtained, no open Critical/High defects (Section 12).
