# SAP SDLC User Guide

## Quick Start
1. Run `/Scope` — describe your business need. Answer any clarifying questions, then approve the BRD.
2. Run `/SolutionArchitect` — confirm your SAP platform when asked; review and sign off the proposed approach.
3. Run `/FunctionalSpec` — answer business-rule questions; review and freeze the Functional Spec (one per RICEFW object).
4. Run `/TechnicalSpec` — review the FS-to-build traceability mapping; freeze the Technical Spec.
5. Run `/Code` — verify SAP connectivity when prompted; review the Build & Unit Test Record.
6. Run `/Testing` — execute Component Test, SIT, String/Cycle, Regression, Performance, Security, then UAT; obtain business sign-off.

Each command tells you exactly what to run next in its handoff message — you don't need to remember the order.

## Where things live
- `Artifacts/` — every frozen document (the real deliverables): `BRD_<name>.md`, `SolutionArchitect_<name>.md`, `FunctionalSpec_<ObjectID>.md`, `TechnicalSpec_<ObjectID>.md`, `Build_<ObjectID>.md`, `Test_Document.md`.
- `execution/<req-id>/` — the append-only clarification transcript and profile history for each requirement.
- `knowledge/` — optional best-practice reference notes (ABAP, RAP, CDS, OData, Clean Core, Integration patterns, SDLC guidelines) you or the AI can consult while working through a phase.
- `templates/` — optional flattened copies of each command's output structure, for quick manual reference outside the chat flow.

## If a document already exists
Each command checks `Artifacts/` before starting and will ask whether to reuse, update, or replace an existing document for the same requirement/object — it will not silently overwrite anything.

## Multiple RICEFW objects in one requirement
`/SolutionArchitect`'s "What Will Be Built" table lists every object. From `/FunctionalSpec` onward, run the chain once per Object ID — each gets its own FS/TS/Build entry, but all objects for a requirement share the single `Test_Document.md`.

