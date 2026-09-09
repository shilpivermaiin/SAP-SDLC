---
description: 'Phase 1 — SAP Business Requirement Document generator. Captures the business need and business case for a new or existing SAP requirement.'
argument-hint: '[short description of the business need]'
---

# Scope — SAP Business Requirement Document Generator (Phase 1: Requirement Gathering & Business Case)

```
/Scope  →  /SolutionArchitect  →  /FunctionalSpec  →  /TechnicalSpec  →  /Code  →  /Testing
```

**Uses skill:** [.claude/skills/scope/SKILL.md](../skills/scope/SKILL.md) — **read it in full before doing anything else.** It holds the complete Purpose & Role, Boundary Rule, Cross-Cutting Concerns, Pre-Check (Existing BRD Guard), Instructions, Clarification Round, Validation/Finalization/Post-Save Confirmation steps, Output Format template, and Writing Guidelines for this phase.

If the user typed a business need after the command, treat it as their opening description of the requirement: $ARGUMENTS

## Hard Gate — BRD Must Exist (mandatory)
Never let the user move past this phase without an actual saved BRD. Before agreeing to proceed to `/SolutionArchitect` or any later phase, check whether a `BRD_<name>.md` for this requirement has been saved in `Artifacts/` and agreed in the skill's Post-Save Confirmation Step.

- If it exists and has been agreed → proceeding is fine.
- If it does **not** exist yet (e.g., the user asks to skip ahead, or to proceed before the draft is validated/saved) → stop and ask: **"No BRD has been generated yet for this requirement. Should I draft and save the BRD now before proceeding? (yes/no)"**
  - **Yes** → run the skill's Validation → Finalization → Post-Save Confirmation steps to produce it, then proceed only once the user agrees.
  - **No** → do not proceed further; the requirement remains blocked at Phase 1 until a BRD is saved and agreed.

**Gate to next phase:** BRD approved and prioritized by the steering committee/product owner before proceeding to `/SolutionArchitect`.
