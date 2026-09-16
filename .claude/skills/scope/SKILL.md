# Scope Skill

Produces `Artifacts/BRD_<Name>.md` from a plain-language (or explicit
`/Scope`) description of a new SAP business need.

## Hard Gate

None — Scope is the first phase in the chain.

## Procedure

1. Run `.claude/skills/onboarding/SKILL.md` (full run for a new
   requirement; skipped/reused for an amendment to an existing one).
2. Build the phase's clarification checklist from the business need as
   described. Typical areas worth checking (only ask what the description
   doesn't already answer):
   - SAP deployment/landscape (ECC vs. S/4HANA Public/Private Cloud) — it
     drives what's even feasible without core modification.
   - Where the new data/behavior comes from: derived from existing master
     data vs. new manual entry vs. both (editable override of a default).
   - Applicability scope: which document types, company codes, countries,
     or org units are in scope vs. explicitly out.
   - Any relevant output/interface channel affected (print, EDI, API, UI).
   - Whether the field/behavior is mandatory or optional.
   - Do **not** ask about deadlines or delivery dates (standing rule).
3. Run the clarification round per `clarify.md` (single batch, skippable,
   recommended defaults labeled).
4. Draft `Artifacts/BRD_<Name>.md` with this structure:

   ```markdown
   # Business Requirement Document — <Requirement Name>

   ## Document Control
   | Field | Value |
   |---|---|
   | Requirement ID | REQ-#### |
   | Requirement Name | <Name> |
   | Artifact Type | Business Requirement Document (BRD) |
   | Phase | Scope |
   | Prepared By | <requester> |
   | Date Prepared | YYYY-MM-DD |
   | Current Version | v1.0 |

   ## Business Background
   ## Business Need / Problem Statement
   ## Objectives
   ## Scope
   ### In Scope
   ### Out of Scope
   ## Requirement Details
   REQ-####.1 — <requirement, testable, unambiguous>
   REQ-####.2 — ...
   ## Impacted SAP Modules / Areas
   ## Stakeholders
   ## Assumptions & Clarifications
   (full clarification round log; ⚠️ before every assumed/default item)
   ## Version History
   | Version | Date | Author | Change Summary |
   |---|---|---|---|
   | v1.0 | YYYY-MM-DD | <author> | Initial draft |

   ## Sign-off & Freeze Status
   **Status:** Draft
   **Frozen On:** —
   **Approved By:** —
   ```

5. Commit the file to `Artifacts/BRD_<Name>.md`. Report the exact path and
   confirm the commit succeeded (or report the error plainly).
6. Ask the user to confirm the BRD for freeze (per `Versioning_Policy.md`);
   on confirmation, update Sign-off & Freeze Status and commit again.
7. Name `/SolutionArchitect` as the next command in the chain.
