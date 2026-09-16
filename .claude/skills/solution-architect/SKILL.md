# Solution Architect Skill

Produces `Artifacts/SolutionArchitect_<Name>.md` from a frozen BRD.

## Hard Gate

`Artifacts/BRD_<Name>.md` must exist with `Status: Frozen`. If not, stop
and tell the user the BRD needs to be completed and frozen via `/Scope`
first.

## Procedure

1. Read `Artifacts/BRD_<Name>.md` in full.
2. Clarification checklist (only what the BRD leaves open):
   - Clean Core classification leaning: is core modification acceptable at
     all for this landscape, or must the solution stay within
     extensibility?
   - Any existing custom objects/enhancements in this area to reuse instead
     of building new ones?
   - Any integration/interface systems touched by this requirement?
3. Run the clarification round per `clarify.md`.
4. Draft `Artifacts/SolutionArchitect_<Name>.md`:

   ```markdown
   # Solution Architecture — <Requirement Name>

   ## Document Control
   | Field | Value |
   |---|---|
   | Requirement ID | REQ-#### |
   | Requirement Name | <Name> |
   | Artifact Type | Solution Architecture |
   | Phase | SolutionArchitect |
   | Prepared By | <author> |
   | Date Prepared | YYYY-MM-DD |
   | Current Version | v1.0 |

   ## Requirement Recap & Traceability
   (map each REQ-####.n to how this design addresses it)

   ## Fit-Gap & Finalized Solution Approach
   (bullet points only — never narrative paragraphs)
   - ...

   ## Clean Core Assessment
   (standard / in-app extensibility / side-by-side / core mod, with
   justification per Governance Principle 4)

   ## Proposed Technical Approach (high level)
   ## Integration & Interface Impact
   ## Data Model Impact
   ## Security & Authorization Impact
   ## Risks & Mitigations
   ## Assumptions & Clarifications
   ## Version History
   ## Sign-off & Freeze Status
   ```

5. Commit to `Artifacts/SolutionArchitect_<Name>.md`, report path and
   commit result.
6. Confirm freeze with the user; update Sign-off & Freeze Status on
   confirmation.
7. Name `/FunctionalSpec` as the next command in the chain.
