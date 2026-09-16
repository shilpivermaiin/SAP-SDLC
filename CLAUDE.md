# SAP-SDLC Framework — Governing Document

This repository implements a governed, six-phase SAP delivery lifecycle for
business requirements, from initial scoping through build and test:

```
/Scope → /SolutionArchitect → /FunctionalSpec → /TechnicalSpec → /Code → /Testing
```

Every phase is driven by a skill under `.claude/skills/<phase>/SKILL.md` and
invoked via a command under `.claude/commands/<Phase>.md`. Shared rules that
apply across all phases live under `.claude/shared/`. This file is the map:
read it first, then follow the routing table below for the phase in play.

A plain-language description of a new SAP business need, with no command
typed, is treated as an implicit `/Scope` invocation.

## 1. Phase routing table

| Invocation | Load (in order) |
|---|---|
| `/Scope` or an implicit new business need | `CLAUDE.md`, `.claude/shared/AI_Behavior_Governance.md`, `.claude/shared/Clarification_Pattern.md`, `.claude/shared/clarify.md`, `.claude/shared/Versioning_Policy.md`, `.claude/skills/onboarding/SKILL.md`, `.claude/skills/scope/SKILL.md`, `.claude/commands/Scope.md` |
| `/SolutionArchitect` | shared files above, then `.claude/skills/solution-architect/SKILL.md`, `.claude/commands/SolutionArchitect.md` |
| `/FunctionalSpec` | shared files above, then `.claude/skills/functional-spec/SKILL.md`, `.claude/commands/FunctionalSpec.md` |
| `/TechnicalSpec` | shared files above (**skip onboarding** — this phase never runs it), then `.claude/skills/technical-spec/SKILL.md`, `.claude/commands/TechnicalSpec.md` |
| `/Code` | shared files above, then `.claude/skills/code/SKILL.md`, `.claude/commands/Code.md` |
| `/Testing` | shared files above, then `.claude/skills/testing/SKILL.md`, `.claude/commands/Testing.md` |

Always use the live current version of every file above — never a remembered
copy from earlier in a session. Before starting any phase, fetch and fully
read every existing artifact under `Artifacts/` relevant to the requirement
in play (the BRD, and any prior SolutionArchitect/FunctionalSpec/
TechnicalSpec/Build/Test_Document covering it) — never truncate or skim.

## 2. Core Principles

1. **One Phase, One Question Round** — clarifying questions for a phase are
   gathered once, presented together as a single batch, and never re-asked.
   See `Clarification_Pattern.md`.
2. **No Fabrication** — never invent SAP table/field names, transaction
   codes, configuration values, or test results. Unknowns become explicit,
   flagged assumptions, not guesses presented as fact.
3. **Traceability** — every artifact, and every requirement/object inside
   it, traces back to a Requirement ID and, from Solution Architect onward,
   to specific BRD requirement line items (e.g. `REQ-0001.2`).
4. **Clean Core First** — prefer standard SAP capability, then extensibility
   (key-user in-app extensibility, side-by-side on BTP), and only fall back
   to core modification with explicit justification and sign-off.
5. **Hard Gate** — a phase cannot start until its upstream artifact is
   frozen. See `Versioning_Policy.md`.
6. **Cross-Phase Change Propagation** — when a scope or functionality change
   is identified after an artifact is frozen, confirm with the user which
   phases/artifacts are affected *before* editing anything, then update each
   affected frozen artifact in place with a new Version History entry. Full
   rule: `AI_Behavior_Governance.md`, Governance Principle 9a.

## 3. Requirement ID and naming conventions

- **Requirement ID**: `REQ-####`, zero-padded, sequential. Assigned once at
  `/Scope` kickoff by the onboarding skill (scan existing
  `Artifacts/BRD_*.md` Document Control tables for the highest existing
  number and increment). Never reassigned across phases.
- **Requirement Name**: a short PascalCase slug agreed at Scope kickoff
  (e.g. `SupplierTaxNumberOnPOHeader`), reused verbatim in every downstream
  artifact filename for that requirement.
- **Artifact filenames** (flat, under `Artifacts/`, no subfolders):
  - `Artifacts/BRD_<Name>.md`
  - `Artifacts/SolutionArchitect_<Name>.md`
  - `Artifacts/FunctionalSpec_<Name>.md`
  - `Artifacts/TechnicalSpec_<Name>.md`
  - `Artifacts/Build_<Name>.md`
  - `Artifacts/Test_Document.md` — a single running document across all
    requirements; each Testing phase run appends a new dated section keyed
    by Requirement ID rather than creating a new file. Never overwritten.

## 4. Document Control standard

Every artifact opens with a **Document Control** table containing only:
Requirement ID, Requirement Name, Artifact Type, Phase, Prepared By, Date
Prepared, Current Version. **Never include a Status row inside this table.**

Freeze/sign-off state and version history live in two separate sections
lower in the document — see `Versioning_Policy.md`.

## 5. Execution logging

- Clarification transcripts and requirement profile history:
  `execution/{req-id}/` (e.g. `execution/REQ-0001/clarifications_Scope.md`).
- Audit logs: `.sapsdlc/logs/`.
- Full rules: `.claude/shared/Execution_Logging.md`. If the write target is
  unavailable for any reason, skip logging silently and continue the
  phase — never let logging block an artifact save.

## 6. Standing conventions (always enforced, independent of file content)

- Never include a Status row inside a Document Control table.
- Never ask about project deadlines, delivery dates, or timeline
  constraints, in any phase.
- Solution Architect's "Fit-Gap & Finalized Solution Approach" section is
  written as bullet points, not narrative paragraphs.
- `/Code` runs as autonomously as `.claude/skills/code/SKILL.md` allows:
  self-connect to available SAP tooling, self-fix build/unit-test issues,
  surface only brief bullets for genuinely manual actions, and
  auto-continue into `/Testing` once the Build & Unit Test Record is done.
- Before propagating a change across phases, confirm with the user which
  phases/artifacts to update before editing anything (Core Principle 6).
