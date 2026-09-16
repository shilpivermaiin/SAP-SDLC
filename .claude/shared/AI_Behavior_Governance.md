# AI Behavior Governance

Behavioral rules for every phase of the SAP-SDLC framework. These bind on
top of, and never loosen, `CLAUDE.md`'s Core Principles.

## Governance Principle 1 — One Phase, One Question Round

Within a single phase, all clarifying questions are identified up front,
consolidated, and presented to the user in one round using the
Clarification Pattern (`Clarification_Pattern.md`, `clarify.md`). Never
split clarification across multiple turns of the same phase, and never
re-ask a question the user already answered or explicitly skipped —
including on a later phase, unless Cross-Phase Change Propagation (below)
reopens that specific area.

## Governance Principle 2 — No Fabrication

Never invent or guess: SAP table names, field/data element names,
transaction codes, config paths, BAdI/enhancement spot names, standard
field lengths, or test execution results. When a technical detail is not
yet knowable at the current phase, say so explicitly and carry it forward
as an open item for the phase that owns that decision (e.g. exact technical
object names belong to `/TechnicalSpec`, not `/Scope`). Never present a
fabricated result as if it were observed.

## Governance Principle 3 — Traceability

- Every requirement in a BRD gets a stable line-item ID: `<Requirement
  ID>.<n>` (e.g. `REQ-0001.1`, `REQ-0001.2`).
- Every downstream artifact section that addresses a requirement cites the
  line-item ID it traces to.
- `/Code` build objects and `/Testing` test cases both cite the Technical
  Spec object and BRD line-item they satisfy.

## Governance Principle 4 — Clean Core First

Evaluate options in this order and document why the chosen one was picked:
1. Standard SAP functionality/configuration, no development.
2. In-app (key-user) extensibility — custom fields, custom logic (BAdIs/
   Business Add-Ins exposed for key-user extensibility), CDS extension
   views.
3. Side-by-side extensibility on SAP BTP.
4. Classic core development (custom includes, core modification) — only
   with explicit justification, called out as a Clean Core deviation, and
   requiring explicit user sign-off before `/TechnicalSpec` finalizes it.

## Governance Principle 5 — Hard Gate

Enforced exactly per `Versioning_Policy.md`. A phase's skill must check the
upstream artifact's Sign-off section before producing any output. If the
upstream artifact is not frozen, stop and tell the user which artifact
needs to be frozen first — this is a structural prerequisite, not a
clarifying question, and it does block progress.

## Governance Principle 6 — Skippable, Non-Blocking Clarifications

Clarifying questions are presented as selectable options (native UI when
available; a numbered list of up to 4 concrete options plus "type your own
answer" otherwise), and skipping is always allowed. A skipped question is
answered with its labeled recommended default and recorded as an explicit
⚠️ assumption in the artifact's Assumptions section. Never gate progress on
an unanswered question.

## Governance Principle 7 — Consistent Document Structure

Every artifact carries: a Document Control table (no Status row), a body
matching its phase's skill, an Assumptions & Clarifications section, a
Version History table, and a Sign-off & Freeze Status section. See
`Versioning_Policy.md` for the latter two.

## Governance Principle 8 — Autonomous Build Execution

`/Code` operates as autonomously as its skill allows:
- Self-connects to any SAP system/tooling connector available in the
  session.
- Self-diagnoses and fixes its own bugs during build and unit testing.
- Surfaces only brief bullet points for actions that genuinely require a
  human (e.g. transport release approval, Basis-only actions, missing
  authorizations).
- Auto-continues into `/Testing` once the Build & Unit Test Record is
  complete — never stops to ask "should I continue?" for routine
  progression through the chain.
- If no live SAP connector is available, produces the Build & Unit Test
  Record as a fully-designed, ready-to-execute plan per the Technical Spec,
  clearly marked that execution is pending a live system connection. Never
  fabricates execution results.

## Governance Principle 9 — Cross-Phase Change Propagation

A change to scope or functionality discovered after an artifact is frozen
is never applied silently.

**9a.** Before editing any artifact to propagate such a change, confirm
with the user exactly which phases and artifacts should be updated. Only
after that confirmation, update each affected frozen artifact in place —
do not create a new file — adding a new Version History entry that
describes the change and references the triggering requirement/decision.
Re-freeze each updated artifact per `Versioning_Policy.md`'s Version 2
check.
