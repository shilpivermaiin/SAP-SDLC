---
name: technical-spec
description: 'Full procedure for the /TechnicalSpec command (Phase 4: Technical Design). Use when generating a Technical Specification (TS) for a requirement (covering every RICEFW object listed for it) from the Functional Spec and Solution Architect write-up — build approach, data model, program logic, Clean Core assessment, performance, unit test design. Design only, no actual code. Invoked by the /TechnicalSpec command.'
---

# Technical Spec Skill — SAP Technical Specification Generator (Phase 4: Technical Design)

> Invoked by the [`/TechnicalSpec`](../../commands/TechnicalSpec.md) command. That file holds the slash-command entry point and Hard Gate; this file holds the complete procedure.

> **Governance:** Read [.claude/shared/AI_Behavior_Governance.md](../../shared/AI_Behavior_Governance.md) in full before this skill. Its rules take priority over anything below.

> **Logging (mandatory):** After the artifact is saved and agreed, apply [.claude/shared/Execution_Logging.md](../../shared/Execution_Logging.md).

> **Versioning (mandatory):** Before starting work on an existing requirement, check [.claude/shared/Versioning_Policy.md](../../shared/Versioning_Policy.md) — if every document for this requirement is already Frozen/Approved/Complete from `/Scope` through `/Testing`, ask whether this should be raised as Version 2 before editing anything.

> **No onboarding role-check in this phase:** Unlike every other phase, `/TechnicalSpec` does **not** run the [onboarding role-check](../onboarding/SKILL.md) — skip it entirely regardless of who is executing the command. By this phase, every business/functional question is already resolved and frozen upstream (BRD, Solution Architect write-up, FS); TS is a pure design exercise against those fixed inputs, so the executing person's role or technical comfort doesn't change what's asked or how it's phrased. Do not ask the role-check question, do not tag a profile, and do not append to `profile-history.md` for this phase.

## When to Use
- The user invokes `/TechnicalSpec` for an Object ID (the requirement's frozen Requirement ID — see Object ID Rule below) with a frozen Functional Spec.
- Deciding the build approach (BAdI/RAP/CDS/enhancement/custom program), data model, and logic mapping for the requirement's object(s).
- Performing the mandatory Clean Core assessment before design.
- Preparing the TS that `/Code` will build against.

## Object ID Rule (framework-wide default)
The Object ID used to name this document (`TechnicalSpec_<ObjectID>.md`) is the same Requirement ID already used by the linked FS — never a technical-style or per-RICEFW-row ID. If the FS covers multiple RICEFW rows/components for this requirement, design all of them together in this **one** TS, under this **one** Object ID, with each component addressed as its own section inside the document rather than producing a separate TS per component. Actual technical/SAP object names (Z-prefixed classes, tables, services, etc.) are derived deterministically from `config/naming-standards.json` and decided *inside* this document's sections — they never replace the tracking Object ID itself, and are never posed to the user as a proposal to confirm (see Step 4 below).

## Purpose
Act as an **SAP Technical Architect**, converting the Functional Specification into the SAP technical design for the requirement's object(s) — determining enhancement, development, integration, and security strategy, from the **Functional Specification** (`/FunctionalSpec`) and the **Solution Architect write-up** (`/SolutionArchitect`).

Design exactly how the object will be built — every FS rule mapped 1:1 to a concrete technical implementation. Review the FS thoroughly as the primary input, assess reuse and Clean Core fit before designing anything new, give explicit consideration to performance, and provide component test cases. This is a **design**, not code — actual implementation happens in `/Code` (Development/Build phase).

**Gate to next phase:** TS frozen and saved (Freeze Confirmation, Step 5).

## Boundary Rule (mirrors the FS boundary, from the other side)
This command owns **all build/design decisions** that FS deliberately did NOT make. Never re-litigate business rules, validation logic, or output requirements — those are frozen in FS. If something functional looks wrong or incomplete, **flag it back to FS rather than silently deciding it**.

| Comes from FS (don't redecide) | Owned here (decide/design) |
|---|---|
| Business rules, validations, calculations | Which BAdI/enhancement spot/user-exit implements each rule |
| Standard SAP tables/BAPIs/IDocs referenced (Section 6a) | New Z-table/Z-structure schema, technical data model |
| Output requirements (what the output should show) | How the output is technically produced (ALV builder, Smart Form logic, OData entity) |
| Error handling behavior (what should happen) | How errors are technically raised (exception classes, message class/number, BAL logging) |
| Test scenarios (business-level, UAT — already defined in FS) | Unit test design, test class structure only |

**Design only:** document the approach — do not write actual code in full; that happens in the Development phase.

## Cross-Cutting Concerns (apply across ALL phases, not one phase alone)
| Concern | How it shows up per phase |
|---|---|
| **Traceability** | BRD ID → Architecture object entry → FS section → TS mapping table → Test case → TR → Go-live confirmation. Every object should be traceable end to end. |
| **Governance** | Steering committee reviews, RAID log (Risks, Assumptions, Issues, Dependencies) maintained continuously. |
| **Security & Authorization** | High-level at Architecture → business rules at FS → technical auth objects at TS → validated in UAT and hypercare. |
| **Data Privacy/Compliance** | Checked at Functional Design (what data is touched) and Testing (masked data usage). |
| **Documentation Discipline** | Each phase's output becomes the next phase's fixed input — no phase should redesign what a prior phase already froze without a formal change process. |

## Workflow
1. **Entry Criteria, Config Review & Reuse Assessment** — confirm before any design work.
2. **Source Discovery** — locate the Functional Spec (and Solution Architect write-up if needed).
3. **Context Pull** — extract everything already known; no questions yet.
4. **Ask the User** — gather only genuine build decisions still open.
5. **Freeze Confirmation** — summarize and get explicit confirmation.
6. **Generate the TS Document** — using the fixed template.
7. **Save to Artifacts** — persist the frozen document.
8. **Handoff** — point to `/Code`.

## 1. Entry Criteria, Config Review & Reuse Assessment
Technical design should **not commence** unless these are satisfied — confirm with the user rather than assuming:

- ☐ The FS has been reviewed thoroughly (primary input), including the underlying gap analysis/definition for background context.
- ☐ The FS has no open items noted in its Assumptions, Dependencies & Technical Spec Input Notes (FS Section 10), and its Entry Criteria & Reuse Assessment (FS Step 1) were satisfied.
- ☐ **Reuse revisited from a technical/build angle** — is there another FS/TS for 1SAP with predominantly the same functionality (check all WRICEF inventories)? Has this WRICEF been built before in another system? Capture the outcome in Section 2a of the generated document.
- ☐ **Clean Core assessment performed (mandatory)** — prefer released APIs, RAP, CDS, and ABAP Cloud; avoid direct modifications to SAP standard objects and unreleased/non-strategic APIs. Capture the outcome in Section 2b.

If any are unmet, flag it back to the user and recommend resolving it in `/FunctionalSpec` first, rather than designing around it.

**The build approach itself is not re-opened here.** If the Solution Architect write-up already fixed the build approach (e.g., classic OData V2/SEGW, a specific BAdI, a specific enhancement spot) and the Clean Core assessment finds it's not the preferred technique (RAP/CDS/OData V4/ABAP Cloud), do **not** ask the user whether to proceed as-is or send it back to `/SolutionArchitect` — that re-litigates a decision already frozen upstream. Instead, silently record the finding as an inherited deviation in Section 2b (User Response: `N/A — approach fixed in Solution Architect write-up`, Status: accepted, Notes: brief factual reference to the SA decision) and carry on. Only raise it as a question if it's a **genuine new blocking conflict** — the fixed approach is technically impossible to implement, not merely non-preferred.

**Recording the user's response for Section 2a and 2b:** present each check to the user individually with the AI's finding, and record the user's actual response in the table's **User Response** column. If the user gives no response to a specific check, record it as `⚪ No response — assumed OK by user` and treat that check as accepted (do not block on silence). Each check in Section 2b must be presented and assessed independently on its own merits — never carry forward or assume a Section 2b answer from a Section 2a response (or vice versa), even if both were silently accepted.

**Configuration review:** note any configuration documentation referenced by the FS and review the existing SAP configuration against the FS's requirements. Check the FS's Test Data Requirements (Section 11) and, where feasible, attempt to create sample test data against the current configuration. Flag any configuration anomaly to the functional team member **immediately** — never silently work around a config gap.

**Before designing:** note any issues/open questions found while reviewing the FS. If necessary, recommend the user set up a walkthrough meeting with the development coordinator before design proceeds.

## 2. Source Discovery
- Look in `Artifacts/` for the linked Functional Spec (`FunctionalSpec_<ObjectID>.md`) and, if needed, the Solution Architect write-up (`SolutionArchitect_<name>.md`).
- Use the FS found here to confirm the Entry Criteria above.
- Multiple `FunctionalSpec_<ObjectID>.md` files found → ask which requirement (Requirement ID) this TS is for. Per the Object ID Rule above, there is no separate per-RICEFW-row Object ID to ask about once the requirement/FS is identified.
- **None found → Backward Dependency Check:** do not just tell the user to go run `/FunctionalSpec` manually. Instead: (1) tell the user the Functional Spec is missing and that you're switching to `/FunctionalSpec` now to generate it; (2) run the full `/FunctionalSpec` flow inline (which itself will cascade back to `/SolutionArchitect`/`/Scope` if those are also missing) until the FS is saved; (3) once confirmed, automatically resume this `/TechnicalSpec` flow from this step using the newly created FS — the user does not need to re-invoke the command.

## 3. Context Pull (no questions yet)
Before asking the user anything:

1. From the linked Functional Spec, extract: Object ID, RICEFW Type, Business Rules (Section 6), Reference Objects (Section 6a), Input/Output Specs, Error Handling, Technical Spec Input Notes (Section 12).
2. From the linked Solution Architect write-up, extract the approach already agreed (e.g., BAdI vs. user-exit, Fiori vs. classic UI, standard vs. custom development).
3. Pre-fill every field that can be reasonably derived. Only ask the user about genuine build decisions still open.

## 4. Ask the User (only what's missing)
**Don't re-ask:** skip anything already extracted in Context Pull (Step 3), already decided in the FS/Solution Architect write-up, or already given by the user earlier in this conversation — including in an earlier group below. Cross-check before asking. This also means never asking the user to reconsider, re-confirm, or choose between keeping vs. reversing a decision the FS/Solution Architect write-up already fixed (e.g., the build approach, a Clean Core deviation already baked into that approach) — carry it forward silently with a factual reference, don't turn it into a question or even a reminder, unless it's a genuine new blocking conflict.

**Technical object naming is never a question, never a proposal.** Every technical/custom object name (package, service, classes, app ID, tile, role, exception class, message class, etc.) is derived mechanically from `config/naming-standards.json`'s fixed patterns (`Z{MODULE}_{PURPOSE}`, `ZCL_{AREA}_{PURPOSE}`, `z{module}.{purpose}`, etc.), using the Module from the Requirement ID and a Purpose abbreviation drawn from the requirement's own name/description. State the derived name directly in the generated document as a fact, not as an option to confirm or override — never ask the user "is this OK" or "would you like different values" for anything `naming-standards.json` already governs. Only ask the user if the config file has genuinely no pattern for that object type at all.

Apply these principles throughout the design, not just one section: follow SAP's standard UI style for any user-facing addition; keep continuous communication with the SAP configuration team; understand how approved scope changes may impact this TS; understand how integration decisions here may impact other work units.

Ask in short batches, grouped by concern:

**A. Development Object Design**
- Technical object name — derive from `config/naming-standards.json`, do not ask (see rule above).
- Which build approach applies — RAP, CDS, OData, BAdI, Enhancement Spot, Workflow, API, user-exit, or a fresh custom program/class? (Reference the Solution Architect write-up's approach if already decided; confirm only if ambiguous.) Prefer RAP/CDS/released APIs/ABAP Cloud over direct modifications or unreleased APIs, per the Clean Core assessment.
- Package/transport request details (Workbench vs. Customizing request) — package name derived from `naming-standards.json`, not asked; Workbench vs. Customizing choice depends on whether any config objects are involved.

**A1. Program Definition(s)** *(one entry per program this TS results in)*
- Common program or new program? If common, what's the existing program name?
- SAP application area?
- Development class/package?
- Authorization group needed to execute the program?
- Related SAP transaction(s)?
- Detailed program description?
- Input/output files used by the program?
- Is a program flow diagram needed to supplement the description?

**B. Data Model**
- Any new Z-tables/structures needed? Field list, data types, key fields?
- Any changes to existing structures (append structures, includes)?

**C. Program / Logic Design**
- High-level processing flow (selection → validation → processing → output) mapped from FS's business rules
- Which FM/BAPI/class methods will implement each FS validation rule

**C1. Performance Considerations**
- Rough estimate of response times and resource consumption?
- What is the most efficient data source for each key lookup (e.g., query `BSID` instead of `BSEG` for open items)?
- What is the most efficient method to pull the data (joins vs. reads, buffering, parallel processing) given expected volume from the FS?

**D. Interface/Integration Design** *(if object is an Interface)*
- Middleware used (CPI/PI/direct RFC/OData)
- Message/payload structure, mapping rules
- Retry/error-queue handling design

**E. UI Design** *(if object involves a screen/Fiori app)*
- Screen/app type (Smart Form, Adobe Form, Fiori Elements, freestyle SAPUI5)
- OData service design (entities, associations) if Fiori/UI5

**F. Error Handling (technical implementation)**
- Exception class hierarchy or message class/number
- Logging approach (Application Log/BAL, custom Z-log table)

**G. Authorization (technical implementation)**
- Authorization objects/checks (`AUTHORITY-CHECK` fields) implementing FS's stated access rules

**H. Unit Test Design**
- Test class structure, key test methods, mock/test data approach

**I. Component Test Plan** *(acceptance test for the whole work unit — all programs working together)*
- Acceptance test criteria for the complete work unit (no integration testing at this stage — component only)
- Expected vs. actual results to be documented per test
- Master and transactional data needed for each test (build on the FS's Test Data Requirements)
- Note: additional test conditions may be added later, in the code phase, by the developer

**Self-check before finalizing:** if an answer changes what the object *does* from a business perspective (a new validation rule, a different output requirement, a changed trigger) rather than *how it's built* — stop and flag it:

> "That sounds like it changes the functional behavior, not just the technical build. Recommend updating the Functional Spec first via `/FunctionalSpec` before finalizing this Technical Spec."

## 5. Freeze Confirmation (before generating final doc)
Summarize with clear status indicators before generating the final document:

```
✅  Entry criteria & reuse assessment       — confirmed (Section 2a: see User Response column)
✅  Clean Core assessment                  — confirmed, no direct modifications (Section 2b: see User Response column)
✅  Development object & build approach     — confirmed (BAdI: XYZ)
✅  Program definition(s)                  — confirmed
✅  Data model                             — confirmed, no new Z-tables needed
✅  Program logic design                   — confirmed
⚠️  Interface/integration design           — partially defined, confirm retry logic
✅  Performance considerations             — confirmed
❌  Unit test design                       — not yet provided
❌  Component test plan                    — not yet provided
```

- ✅ Green check = confirmed, ready to freeze
- ⚠️ Yellow = partially answered, will proceed with a stated assumption unless corrected
- ❌ Red = missing, must be answered before freeze if it's a core section (Program Logic Design, Data Model, or Error Handling)

Ask: **"Ready to freeze this Technical Spec? (yes / edit a section)"**
Do not generate the final document until confirmed, unless the user explicitly says to proceed with assumptions.

## 6. Generate the TS Document
Use this structure, consistent with the FS template so both documents cross-reference cleanly:

```markdown
# Technical Specification

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | (the requirement's Requirement ID — see Object ID Rule above; never a technical-style ID) |
| Object Name (Technical) | |
| RICEFW Type | (list all types covered if this requirement has multiple RICEFW rows) |
| Linked Functional Spec Ref | |
| Linked Solution Architect Ref | |
| Author | |
| Version | |
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | | | Initial creation | |

## 2. Development Object Overview
- Object type, naming convention used, package, transport request

## 2a. Reuse Assessment (Revisited)
| Check | AI Finding | User Response | Status | Notes |
|---|---|---|---|---|
| Another FS/TS for 1SAP with predominantly the same functionality? (all WRICEF inventories considered) | | | | |
| WRICEF previously developed in another system? | | | | |

## 2b. Clean Core Assessment (Mandatory)
| Check | AI Finding | User Response | Status | Notes |
|---|---|---|---|---|
| Prefer released APIs, RAP, CDS, ABAP Cloud over classic techniques? | | | | |
| Any direct modification of an SAP standard object? (must be avoided) | | | | |
| Any unreleased/non-strategic API used? (must be avoided, or justified if unavoidable) | | | | |

> **User Response** legend: ✅ Accepted / ❌ Rejected (raise and resolve before freezing) / ⚪ No response — assumed OK by user / `N/A — approach fixed in Solution Architect write-up` (used when the underlying build approach, and therefore this check's outcome, was already decided upstream — do not ask the user about it, just cite the SA reference in Notes). Each row's response is independent — a 2a response is never assumed to apply to 2b, and vice versa.

## 2c. Object Inventory & Impacted Components
| Object Name | Type (Table/CDS View/RAP Object/OData Service/API/Interface/Class) | New or Impacted (Existing) | Description |
|---|---|---|---|

## 3. Build Approach
- Build approach selected: RAP / CDS / OData / BAdI / Enhancement Spot / Workflow / API / Custom Program or Class / User-Exit
- Justification (why this approach, referencing Solution Architect write-up decision and the Clean Core assessment above)
- Confirm the approach follows SAP's standard UI style where user-facing (modifications, user exits, etc.)

## 4. Data Model
| Object | Type (Table/Structure/Append) | Fields | Key Fields |
|---|---|---|---|

## 4a. Program Definition(s)
> One row set per program this TS results in.

| Field | Program 1 | Program 2 |
|---|---|---|
| Common or New Program? (name if common) | | |
| Application | | |
| Development Class | | |
| Authorization Group | | |
| SAP Transaction(s) | | |
| Program Description | | |
| Input/Output Files | | |
| Program Flow (diagram/description) | | |

## 5. Program / Processing Logic Design
- Flow diagram or step-by-step technical flow
- Mapping table: FS Business Rule → Technical Implementation

| FS Rule Ref | Business Rule (from FS) | Technical Implementation |
|---|---|---|

## 6. Reference Objects Used (from FS Section 6a + any additional technical ones)
| Object Type | Object Name | Usage |
|---|---|---|

## 7. Interface / Integration Design *(if applicable)*
- Middleware, payload structure, mapping, retry/error-queue design

## 8. UI / Output Technical Design
- Form/report/Fiori technical design, OData entities if applicable

## 9. Error Handling (Technical)
- Exception classes / message class-number
- Logging approach

## 10. Authorization Design
- Authorization objects and checks implementing FS's access rules

## 10a. Transport Strategy
- Workbench vs. Customizing request, package — one Workbench (+ one Customizing, if needed) request per Object ID, per `/Code`'s Single Transport Request Rule

## 11. Performance Considerations
- Rough estimate of response times and resource consumption
- Most efficient data source per key lookup (e.g., `BSID` vs. `BSEG` for open items)
- Most efficient method to pull data (joins vs. reads, buffering, parallelization) given expected volume from the FS

## 12. Unit Test Design
| # | Test Case | Method/Class | Expected Result |
|---|---|---|---|

## 12a. Component Test Plan
> Acceptance test for the whole work unit (all programs working together). No integration testing at this stage. Additional test conditions may be added later, in the code phase, by the developer.

| # | Acceptance Test Criteria | Master/Transactional Data Used | Expected Result | Actual Result |
|---|---|---|---|---|

---
**Next step:** Run `/Code` referencing this document (Object ID: ___) to build and unit-test the object.
```

## 7. Save to Artifacts
- Ensure the `Artifacts/` folder exists; create it if missing.
- Save the frozen document as `TechnicalSpec_<ObjectID>.md`, where `<ObjectID>` is the requirement's Requirement ID (per the Object ID Rule above) — in `Artifacts/`.
- Confirm the saved file path to the user.
- If the user later requests edits, apply them, overwrite the same file (no duplicates), and briefly summarize what changed.

## 8. Handoff Message (end of command output)
After generating the doc, end the response with:

> ✅ **Technical Spec frozen for [Object ID – Object Name].**
> 👉 Next command: **`/Code`** — this will use this TS to build and unit-test the object.

## Guardrails Summary

| Do | Don't |
|---|---|
| Confirm FS entry criteria and revisit reuse before starting design | Start design while the FS has open issues or unmet entry criteria |
| Flag configuration anomalies to the functional team member immediately | Silently work around a configuration gap |
| Design BAdI/enhancement/custom object approach | Redefine business rules already frozen in FS |
| Design new Z-table/structure schemas | Change output/validation requirements without flagging back to FS |
| Document each program definition (application, dev class, auth group, transaction) | Leave program definitions undocumented |
| Map each FS business rule to a technical implementation (traceability table) | Leave FS rules unmapped or untraceable |
| Design technical error handling (exception classes, logging) | Change the *expected behavior* on error (that's FS's call) |
| Estimate performance and choose the most efficient data source/pull method | Ignore performance until after build |
| Design unit tests and a component test plan (whole work unit, no integration) | Skip unit test or component test design entirely, or redefine FS's UAT scenarios |
| Perform the Clean Core assessment; prefer released APIs/RAP/CDS/ABAP Cloud | Directly modify SAP standard objects or use unreleased APIs without justification |
| Record each Section 2a/2b check's actual user response; default to "assumed OK" only when the user gave no response | Assume a check is accepted without presenting it to the user, or carry a 2a response into 2b (or vice versa) |
