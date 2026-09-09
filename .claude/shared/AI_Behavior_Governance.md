---
description: Global AI governance rules for SAP-SDLC. Every command, skill, and artifact must follow these rules.
---

> **Priority: Highest.** Applies to all six phases (`/Scope`, `/SolutionArchitect`, `/FunctionalSpec`, `/TechnicalSpec`, `/Code`, `/Testing`). These rules take priority over any individual command or skill instruction.

# AI Behavior Governance

## Purpose

This document defines mandatory behavior standards for all AI agents operating within the SAP-SDLC framework.

Every phase (`/Scope`, `/SolutionArchitect`, `/FunctionalSpec`, `/TechnicalSpec`, `/Code`, `/Testing`) must follow these rules to ensure:

- Consistency
- Traceability
- SAP Best Practice Alignment
- Clean Core Compliance
- Security by Design
- Quality by Design
- Auditability
- Enterprise Readiness

These rules have **higher priority than any individual prompt or skill instruction**. If a phase-specific `SKILL.md` ever conflicts with this document, this document wins; flag the conflict to the user rather than silently resolving it.

## How This Document Is Used

- This is a **global, cross-cutting** layer — it does not replace the phase-specific procedure in each `.claude/skills/<name>/SKILL.md`. Each `SKILL.md` still owns the "how" (workflow steps, Ask-the-User groups, Output Format template) for its own phase.
- Every command (`.claude/commands/*.md`) and every skill (`.claude/skills/*/SKILL.md`) must read this document, in addition to its own skill, before producing output.
- The **Phase Boundaries**, **No-Fabrication Rule**, and **Platform Compatibility Rule** below are the detailed, authoritative version of what each phase is allowed to answer; the summary table in [CLAUDE.md](../../CLAUDE.md) is a quick-reference pointer to this section, not a separate source of truth. This document does not override phase boundaries — it constrains *how* every phase behaves within its own boundary.

---

# Core Principles

## Principle 1: Business First

Always understand the business problem before proposing a solution.

Before generating output:

- Identify business objective.
- Identify expected outcome.
- Identify affected business process.
- Identify stakeholder value.

Never jump directly to coding.

Correct Order:

Requirement
→ Business Need
→ Solution
→ Design
→ Build
→ Test

---

## Principle 2: Standard SAP First

Always evaluate SAP standard functionality before recommending custom development.

Preference Order:

1. Standard SAP Configuration
2. Released SAP API
3. Key User Extensibility
4. RAP
5. CDS Extension
6. Enhancement Spot
7. BAdI
8. Custom Development

Avoid unnecessary custom objects.

---

## Principle 3: Clean Core

All recommendations must align with SAP Clean Core principles wherever possible.

Prefer:

- RAP
- CDS View Entities
- Released APIs
- OData V4
- ABAP Cloud
- SAP BTP Extensions

Avoid:

- Direct Modifications
- Core SAP Changes
- Unreleased Objects
- Implicit Enhancements
- Direct Database Updates

If Clean Core cannot be achieved:

- Document it exactly once, as a single Risk entry (with a mitigation) — never as extra explanatory prose repeated elsewhere in the same document (e.g., inside a chosen-approach narrative).
- That Risk entry's rationale must cite objective factors only — timeline, cost, effort, reuse, standards alignment, or an explicit stakeholder decision. Never attribute the deviation to a team's/individual's skill, competency, or capability gap, or use any other subjective/judgmental phrasing about people.

---

## Principle 4: Security by Design

Every solution must consider security.

Review:

- Authentication
- Authorization
- Sensitive Data
- Audit Requirements
- Role Impact
- Data Privacy

Always identify:

- Security Risks
- Authorization Requirements
- Compliance Considerations

---

## Principle 5: Performance by Design

All solutions must consider scalability and performance.

Evaluate:

- Database Impact
- Integration Volume
- Transaction Volume
- User Load

Avoid:

- SELECT *
- Nested Database Access
- Unnecessary Loops
- Full Table Scans

Recommend:

- CDS Pushdown
- Optimized APIs
- Efficient Queries

---

## Principle 6: Testability by Design

Every solution must be testable.

Consider:

- Unit Testing
- SIT
- UAT
- Regression Testing

Every Technical Specification must include:

- Test Strategy
- Test Scenarios
- Validation Approach

---

## Principle 7: Reusability

Prefer reusable designs and reusable SAP assets.

Reuse:

- Existing Classes
- Existing APIs
- Existing CDS Views
- Existing Integrations
- Existing Business Processes

Avoid duplication.

---

## Principle 8: Traceability

Every artifact must be traceable to business requirements.

Maintain links:

Requirement
↓
Scope (BRD)
↓
Solution Design (Solution Architect write-up)
↓
Functional Specification
↓
Technical Specification
↓
Code (Build & Unit Test Record)
↓
Testing (Test Document)

Every document must reference its predecessor (see **Cross-References** in [CLAUDE.md](../../CLAUDE.md)).

---

## Principle 9: Change Control

Never silently absorb a new requirement discovered mid-phase.

- A requirement, rule, or scope change discovered during `/FunctionalSpec`, `/TechnicalSpec`, `/Code`, or `/Testing` must be raised as an explicit change back to the owning upstream artifact, not folded in quietly.
- Every custom object built in `/Code` must move through exactly one Workbench transport request and, if needed, exactly one Customizing request per Object ID — never split or reused across unrelated objects.
- Defects found in `/Testing` follow Open → In Progress → Fixed → Retested → Closed; a defect is never marked Closed without a retest record.
- If the requirement's **full lifecycle is already complete** (every document Frozen/Approved from `/Scope` through `/Testing`), a further change is not an ordinary mid-phase change — see [Versioning_Policy.md](Versioning_Policy.md), which governs when this must instead be raised as a new version of the requirement.

### Principle 9a: Cross-Phase Change Propagation (mandatory)

Whenever the user asks to **drop, add, modify, or update any functionality, scope item, business rule, or requirement** for a requirement that already has one or more artifacts (`BRD_*`, `SolutionArchitect_*`, `FunctionalSpec_*`, `TechnicalSpec_*`, `Build_*`, `Test_Document.md`), the AI must treat it as a change that potentially affects **every phase**, not just the phase currently in focus.

1. **Ask before propagating.** Before making any edit, ask the user — through the interactive selection UI (`AskUserQuestion`), per the Clarifying Question Behavior — to confirm they want the change **reflected in all phases and in every existing document**. Present the specific list of phases/artifacts that would change. Do not start editing until the user confirms the scope of propagation (they may choose to limit it — e.g. "only the FS onward").
2. **Propagate through the whole chain.** On confirmation, walk `/Scope → /SolutionArchitect → /FunctionalSpec → /TechnicalSpec → /Code → /Testing` in order. For each phase whose frozen artifact exists and is affected:
   - update the artifact in place (same file path — never a duplicate),
   - add a Version History row describing the change and bump the version,
   - keep every cross-reference and traceability link consistent,
   - carry the change down as fixed input to the next phase (do not re-litigate it there).
3. **Record it as a change, not a silent edit.** Note the change, its trigger (the user's request, dated), and its downstream impact in each artifact's Assumptions/Risks/Change log area and in the requirement's `execution/{req-id}/` clarification logs.
4. **Downstream build/test impact.** If `/Code` or `/Testing` work already exists, state explicitly what must be rebuilt, re-tested, or backed out (e.g. objects to delete, unit tests to drop, transport entries affected) — never leave a built object silently inconsistent with the revised spec.
5. **Full-lifecycle-complete requirements** still first go through the [Versioning_Policy.md](Versioning_Policy.md) check (raise as Version 2 vs. edit in place); the propagation in this rule then applies to whichever path the user chooses.

This rule has the same cross-phase priority as the rest of this document — every skill must apply it regardless of which phase invoked the AI.

---

# Mandatory Analysis Framework

Before generating output, analyze:

## Functional Impact

Questions:

- Which process is changing?
- Which users are affected?
- Which business rules are impacted?

---

## Technical Impact

Questions:

- Which objects are impacted?
- Which interfaces are impacted?
- Which reports are impacted?

---

## Security Impact

Questions:

- Are new authorizations required?
- Is sensitive data affected?
- Are compliance requirements impacted?

---

## Integration Impact

Questions:

- SAP-to-SAP impact?
- SAP-to-NonSAP impact?
- External API impact?

---

## Reporting Impact

Questions:

- Existing reports impacted?
- Data model impacted?
- Analytics impacted?

---

# Mandatory Deliverable Sections

The following sections must be included whenever applicable, in addition to each phase's own Output Format template.

## Assumptions

Clearly list assumptions made.

Example:

- Customer data exists.
- Required authorization roles exist.
- External system is available.

Never hide assumptions. Label them explicitly per the No-Fabrication Rule — never blend an assumption silently with user-provided content.

---

## Risks

Always identify risks.

Categories:

- Business Risk
- Functional Risk
- Technical Risk
- Security Risk
- Integration Risk
- Deployment Risk

---

## Dependencies

Always identify dependencies.

Examples:

- External Systems
- SAP Modules
- Third-Party Vendors
- Business Teams

---

## Recommendations

Always provide recommendations.

Include:

- Preferred Option
- Alternative Option
- Pros
- Cons

---

# SAP Technology Decision Rules

When generating solutions use the following guidance.

## UI Applications

Preferred:

RAP
→
OData V4
→
Fiori Elements

---

## Analytical Requirements

Preferred:

CDS Views
→
Analytical Queries
→
Fiori Analytics

---

## Integrations

Preferred:

API
→
Event
→
IDoc
→
Proxy

Select based on business need.

---

## Extensions

Preferred:

Key User Extension
→
Released APIs
→
RAP Extension
→
BAdI

---

# Documentation Standards

All generated documents must:

- Include title
- Include document purpose
- Include assumptions
- Include dependencies
- Include risks
- Include recommendations
- Include the upstream artifact Cross-Reference(s) required by [CLAUDE.md](../../CLAUDE.md)

Use professional business language.

Avoid unnecessary technical jargon unless document type requires it.

---

# Prohibited Behavior

AI must never:

- Invent SAP transactions.
- Invent SAP tables.
- Invent SAP APIs.
- Invent SAP CDS Views.
- Invent business approvals.
- Invent user requirements.
- Invent integration endpoints.
- Assume technical details without stating assumptions.
- Answer a question that belongs to a different phase (see the Phase Boundary Table).
- Proceed past a phase's Hard Gate without the required upstream artifact frozen and signed off.

If information is missing:

Document assumptions explicitly, or ask a batched clarifying question per the Clarifying Question Behavior in [CLAUDE.md](../../CLAUDE.md).

---

# Quality Validation Checklist

Before completing any phase verify:

## Requirement Understanding

✓ Business objective understood

✓ Stakeholders identified

✓ Scope understood

---

## Solution Quality

✓ Standard SAP considered

✓ Clean Core considered

✓ Security considered

✓ Performance considered

✓ Testing considered

---

## Documentation Quality

✓ Assumptions included

✓ Risks included

✓ Dependencies included

✓ Recommendations included

---

# Workflow Completion Rule

A phase is complete only when:

✓ Output generated

✓ Assumptions documented

✓ Risks documented

✓ Dependencies documented

✓ Recommendations documented

✓ Quality validation performed

✓ Traceability maintained

If any item is missing:

Output Status = PARTIAL — say so explicitly to the user rather than presenting a partial result as complete.

---

# SAP-SDLC Golden Rule

Every generated output must answer:

1. What business problem is being solved?
2. Why is the solution required?
3. What SAP capability should be used?
4. What are the risks?
5. How will it be tested?
6. How will it be supported?
7. Is it Clean Core compliant?
8. Is there a simpler SAP standard alternative?

Failure to answer these questions indicates an incomplete solution.

---

## Phase Boundaries

Each skill answers exactly ONE question. If output starts answering a different skill's question, stop and redirect.

| Skill | Answers | Produces | Must NOT contain |
|---|---|---|---|
| scope | What does the business need, and why? | BRD | Any solution approach, platform, or technical mention |
| solution-architect | What kind of solution, on what platform? | Architecture Doc | Specific object/class/service names; RICEFW checklist-style itemization |
| functional-spec | What should it do, exactly? | Functional Spec | Build decisions (BAdI choice, enhancement spot, new Z-table schema, class design) |
| technical-spec | How, exactly, will it be built? | Technical Spec | Redefinition of FS business rules; full code (design only) |
| code | Build it, exactly as designed | Working code + unit tests in SAP | New business logic/design not traceable to TS |
| testing | Does it work, per FS and TS? | Test evidence, defect log, sign-off | New requirements invented during testing (raise a change instead) |

**Self-check before any skill finalizes output:** *"Am I answering my own skill's question, or did I drift into another skill's territory?"* If drifted: stop, rewrite at the correct level, note the extra detail as an input for the correct downstream skill.

**Gate rule:** no skill may begin until its required upstream artifact is Frozen/Signed-off. If missing, stop and tell the user which artifact is needed first.

## No-Fabrication Rule

Every skill formalizes and structures what the user actually provides. It does not invent content to fill gaps or look complete.

**Never:** invent business rules/validations/edge cases the user never stated; guess standard SAP object names (tables/BAPIs/IDocs) because they "sound right"; guess technical build objects (BAdI/class/service names) not yet decided; pad a thin answer with boilerplate; present an inference as if the user stated it directly.

**Always:** ask a direct clarifying question whenever a section would otherwise be filled by assumption; label inferred content explicitly ("Assumed based on your description: ___ — please confirm"); use status indicators at freeze time (CONFIRMED / ASSUMED-PARTIAL / MISSING).

**Self-check:** *"Did the user actually say this, or did I infer/generate it?"*

## Platform Compatibility Rule

Primarily used by solution-architect, but binding on functional-spec/technical-spec/code too — none may assume capabilities the confirmed platform doesn't support.

**Rule 1 — every confirmed constraint is a hard filter, not just intake.** Any confirmed fact (platform, SAP version, deployment model, integration landscape) must actively filter every option suggested afterward. Incompatible with a confirmed constraint → drop silently, never present it. Conditionally valid (depends on an add-on/license) → ASK, never assume. Valid but a fundamentally different pattern (different platform/deployment) → flag explicitly, never bundle as equivalent.

**Rule 2 — approach = one coherent narrative, not a checklist of parts.** Architecture-level output is a single sentence/short paragraph describing the solution shape — never a list of technical components. Test: if the answer could be restated as "X + Y + Z + W" rather than read as one flowing description, it has drifted into implementation detail (belongs downstream).

**Sequencing:** gather all constraint-defining answers FIRST. Apply filtering silently. Present only 1-3 valid, high-level narratives.
