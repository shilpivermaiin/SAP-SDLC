# Code Skill

Produces `Artifacts/Build_<Name>.md` from a frozen Technical Specification.
Runs as autonomously as this skill allows (Governance Principle 8) — no
routine "should I continue?" prompts.

## Hard Gate

`Artifacts/TechnicalSpec_<Name>.md` must exist with `Status: Frozen`. If
not, stop and tell the user the Technical Spec needs to be completed and
frozen via `/TechnicalSpec` first.

## Procedure

1. Read the Technical Spec for this requirement in full.
2. Check whether a live SAP system/tooling connector is available in the
   current session (e.g. an SAP BTP/ABAP MCP connector). This is a
   capability check, not a clarifying question.
3. **If a connector is available:**
   - Create each object listed in the Technical Spec's Objects List.
   - Run unit tests per the Unit Test Approach.
   - Self-diagnose and fix build/unit-test failures without stopping to
     ask, up to the limits of what's actually fixable in code/config.
   - Record actual results (object keys, transport numbers, unit test
     pass/fail) — never fabricate a result that wasn't actually produced
     by the tooling.
   - Surface only brief bullet points for genuinely manual actions (e.g.
     transport release requiring Basis approval, an authorization grant
     only an admin can make).
4. **If no connector is available:**
   - Produce the Build & Unit Test Record as a fully-designed,
     ready-to-execute build plan derived directly from the Technical Spec
     — concrete steps a developer would run, in order.
   - Mark it clearly: **"Execution Pending Live SAP System Connection"**.
   - Never fabricate object creation confirmations or test results.
5. Draft `Artifacts/Build_<Name>.md`:

   ```markdown
   # Build & Unit Test Record — <Requirement Name>

   ## Document Control
   | Field | Value |
   |---|---|
   | Requirement ID | REQ-#### |
   | Requirement Name | <Name> |
   | Artifact Type | Build & Unit Test Record |
   | Phase | Code |
   | Prepared By | <author> |
   | Date Prepared | YYYY-MM-DD |
   | Current Version | v1.0 |

   ## Execution Mode
   (Live system connection / Execution Pending Live SAP System Connection)
   ## Objects Built (or Planned)
   (per Technical Spec's Objects List, with status)
   ## Unit Test Results (or Planned Unit Test Steps)
   ## Manual Actions Required
   (brief bullets only; empty if none)
   ## Assumptions & Clarifications
   ## Version History
   ## Sign-off & Freeze Status
   ```

6. Commit to `Artifacts/Build_<Name>.md`, report path and commit result.
7. Confirm freeze with the user only if execution actually completed
   (Status stays Draft while pending live execution, since it isn't done
   yet); update Sign-off & Freeze Status on confirmation.
8. **Auto-continue into `/Testing`** once this artifact is saved — do not
   stop and ask whether to proceed.
