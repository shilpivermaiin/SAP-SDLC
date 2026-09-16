# Functional Spec Skill

Produces `Artifacts/FunctionalSpec_<Name>.md` from a frozen Solution
Architecture document.

## Hard Gate

`Artifacts/SolutionArchitect_<Name>.md` must exist with `Status: Frozen`.
If not, stop and tell the user the Solution Architecture needs to be
completed and frozen via `/SolutionArchitect` first.

## Procedure

1. Read the BRD and Solution Architecture documents for this requirement in
   full.
2. Clarification checklist (only what's still open):
   - Exact screen/tab placement and field behavior (visible, editable,
     mandatory, default value source) where the Solution Architecture left
     it at a design-approach level.
   - Validation rules (format, length, uniqueness) for any new field.
   - Print/output layout expectations (placement, label wording) if the
     requirement touches an output form.
3. Run the clarification round per `clarify.md`.
4. Draft `Artifacts/FunctionalSpec_<Name>.md`:

   ```markdown
   # Functional Specification — <Requirement Name>

   ## Document Control
   | Field | Value |
   |---|---|
   | Requirement ID | REQ-#### |
   | Requirement Name | <Name> |
   | Artifact Type | Functional Specification |
   | Phase | FunctionalSpec |
   | Prepared By | <author> |
   | Date Prepared | YYYY-MM-DD |
   | Current Version | v1.0 |

   ## Traceability to BRD & Solution Architecture
   ## Functional Requirements Detail
   (screen/field behavior, business rules, validations — per REQ-####.n)
   ## Process Flow
   ## Configuration Requirements (functional, non-technical)
   ## UI / UX Detail
   ## Print / Output Layout Requirements
   ## Test Scenarios (high level — detailed cases belong to /Testing)
   ## Assumptions & Clarifications
   ## Version History
   ## Sign-off & Freeze Status
   ```

5. Commit to `Artifacts/FunctionalSpec_<Name>.md`, report path and commit
   result.
6. Confirm freeze with the user; update Sign-off & Freeze Status on
   confirmation.
7. Name `/TechnicalSpec` as the next command in the chain.
