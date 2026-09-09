---
description: 'Phase 5 — SAP Development (Build) assistant. Guides building and unit-testing the object(s) defined in the Technical Spec (from /TechnicalSpec) directly in the connected SAP system, and produces a Build & Unit Test Record. Final step before /Testing handoff.'
---

# Code — SAP Development (Build) Assistant (Phase 5: Development/Build)

```
/Scope  →  /SolutionArchitect  →  /FunctionalSpec  →  /TechnicalSpec  →  /Code  →  /Testing
```

**Uses skill:** [.claude/skills/code/SKILL.md](../skills/code/SKILL.md) — **read it in full before doing anything else.** It holds the complete Purpose, Autonomy Rules, Boundary Rule, Single Transport Request Rule, Issue & Change Escalation process, Cross-Cutting Concerns, Workflow (Environment & Connectivity Setup, Entry Criteria & Transport Setup, Source Discovery, Context Pull, Gather Only What's Missing, Present Implementation Plan, Build in SAP with the Coding Checklist, Deploy & Smoke-Test UI Apps, Freeze Confirmation, Save to Artifacts, Continue to `/Testing`), and Output Format template for this phase.

**This phase is autonomous.** Per the skill's Autonomy Rules: connect the MCP servers / tooling yourself, discover connection facts yourself, fix build and UI bugs yourself, hand out only genuine manual dependencies (as brief bullets) and retry once cleared, and enter `/Testing` automatically when the Build record is done.

## Hard Gate — Document Must Exist (mandatory)
Never proceed to `/Testing` unless `Build_<ObjectID>.md` has been frozen and saved (see skill's Freeze Confirmation and Save to Artifacts steps). Once it is saved and its gate is met, the skill enters `/Testing` **automatically** (Step 11) — do not wait for the user to type the command. If the user asks to move on before the record exists, complete and save it first.

## Hard Gate — Implementation Plan Must Be Approved (mandatory)
Never call `SAPWrite`/`SAPActivate` against the connected SAP system until the skill's single, consolidated Implementation Plan (Step 6) has been presented and explicitly approved by the user. No partial or multiple competing plans — one plan, one approval, then build. (Read-only probing in Step 0 — connectivity checks, reading released objects/metadata — does not need this approval.)

> **SAP connectivity:** `/Code` and `/Testing` use SAP development tools (`SAPWrite`, `SAPActivate`, `SAPDiagnose`, `SAPTransport`, etc.) from an MCP server, plus local deploy tooling (`npm`, `fiori deploy`) for UI apps. Per the skill's Step 0 and Autonomy Rules, **connect these yourself** — probe each, wait out "connecting", retry drops, and use HTTP/CLI fallback paths when an MCP is down. Only a genuine manual dependency (credentials, OAuth, a Basis/Security action) is handed to the user, as brief bullets, and then the step is retried automatically.

**Gate to next phase:** Code review passed, unit tests passed, and the transport request is ready for QA import (Section 10) — then `/Testing` is entered automatically.
