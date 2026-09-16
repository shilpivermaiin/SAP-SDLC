# Technical Spec Skill

Produces `Artifacts/TechnicalSpec_<Name>.md` from a frozen Functional
Specification. Per `CLAUDE.md`'s routing table, this phase **never** runs
the onboarding skill.

## Hard Gate

`Artifacts/FunctionalSpec_<Name>.md` must exist with `Status: Frozen`. If
not, stop and tell the user the Functional Spec needs to be completed and
frozen via `/FunctionalSpec` first.

## Procedure

1. Read the BRD, Solution Architecture, and Functional Spec for this
   requirement in full.
2. Clarification checklist (only what's still open, and only genuinely
   technical decisions — never re-litigate functional behavior already
   frozen):
   - Exact enhancement technique (e.g. custom field via CI include vs.
     key-user extensibility app vs. BAdI implementation) where the
     Solution Architecture named an approach but not a specific object.
   - Object naming/namespace convention to use (Z or Y, per landscape).
   - Print technology in play (SAPscript / Smart Forms / Adobe Forms) if
     not already fixed.
3. Run the clarification round per `clarify.md`.
4. Draft `Artifacts/TechnicalSpec_<Name>.md`. Never fabricate specific
   table/field/object names that don't come from the actual landscape —
   if the real system hasn't been inspected, name objects using the
   agreed namespace convention and mark them clearly as proposed, pending
   confirmation against the live system in `/Code`.

   ```markdown
   # Technical Specification — <Requirement Name>

   ## Document Control
   | Field | Value |
   |---|---|
   | Requirement ID | REQ-#### |
   | Requirement Name | <Name> |
   | Artifact Type | Technical Specification |
   | Phase | TechnicalSpec |
   | Prepared By | <author> |
   | Date Prepared | YYYY-MM-DD |
   | Current Version | v1.0 |

   ## Traceability to BRD / Solution Architecture / Functional Spec
   ## Technical Design
   (data element, domain, table/include or extension field, enhancement
   spot / BAdI / user exit, per REQ-####.n)
   ## Objects List
   | Object Type | Proposed Name | Purpose | Namespace |
   |---|---|---|---|
   ## Print / Output Technical Design
   (form technology, driver program touchpoint, layout changes)
   ## Data Dictionary Changes
   ## Authorization Objects
   ## Unit Test Approach
   ## Transport & Migration Notes
   ## Assumptions & Clarifications
   ## Version History
   ## Sign-off & Freeze Status
   ```

5. Commit to `Artifacts/TechnicalSpec_<Name>.md`, report path and commit
   result.
6. Confirm freeze with the user; update Sign-off & Freeze Status on
   confirmation.
7. Name `/Code` as the next command in the chain.
