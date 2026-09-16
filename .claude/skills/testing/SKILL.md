# Testing Skill

Produces/updates `Artifacts/Test_Document.md` — a single running document
across all requirements — from a Build & Unit Test Record.

## Hard Gate

`Artifacts/Build_<Name>.md` must exist for this requirement. If not, stop
and tell the user the Build & Unit Test Record needs to be produced via
`/Code` first.

## Procedure

1. Read the BRD, Functional Spec, Technical Spec, and Build & Unit Test
   Record for this requirement in full.
2. Read the existing `Artifacts/Test_Document.md` in full if it exists —
   never truncate it. If it doesn't exist yet, create it fresh with the
   structure below.
3. Clarification checklist (only what's still open):
   - Any specific negative/edge-case scenarios the business wants covered
     beyond the Functional Spec's high-level Test Scenarios.
4. Run the clarification round per `clarify.md`.
5. Append a new dated section to `Test_Document.md` for this requirement
   (never overwrite a prior requirement's section):

   ```markdown
   # Test Document

   <!-- If the file is new, put the Document Control table for the
        Test_Document artifact type here once; otherwise leave the
        existing header untouched and just append a new section below. -->

   ---

   ## REQ-#### — <Requirement Name> — <YYYY-MM-DD>

   ### Traceability
   (map each BRD REQ-####.n to the test cases below)

   ### Test Scenarios & Cases
   | Case ID | Scenario | Steps | Expected Result | Actual Result | Status |
   |---|---|---|---|---|---|

   If the Build was "Execution Pending Live SAP System Connection", mark
   every Actual Result / Status as **Pending Live Execution** — never
   fabricate a pass/fail.

   ### Defects Logged
   ### Assumptions & Clarifications
   ### Version History
   | Version | Date | Author | Change Summary |
   |---|---|---|---|
   | v1.0 | YYYY-MM-DD | <author> | Added test section for REQ-#### |

   ### Sign-off & Freeze Status
   **Status:** Draft
   **Frozen On:** —
   **Approved By:** —
   ```

6. Commit to `Artifacts/Test_Document.md`, report path and commit result.
7. Confirm freeze with the user for this requirement's section once
   testing is actually complete; update its Sign-off & Freeze Status on
   confirmation.
8. This is the final phase in the chain — no next command to name. Summarize
   the requirement's end-to-end status across all six artifacts.
