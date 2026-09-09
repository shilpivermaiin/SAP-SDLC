---
name: functional-spec
description: 'Full procedure for the /FunctionalSpec command (Phase 3: Functional Design). Use when generating a Functional Specification (FS) for a requirement (covering every RICEFW object listed for it) from the Solution Architect write-up and BRD — business rules, input/output, error handling, authorization, UAT scenarios. Technology-independent business behavior only, no build decisions. Invoked by the /FunctionalSpec command.'
---

# Functional Spec Skill — SAP Functional Specification Generator (Phase 3: Functional Design)

> Invoked by the [`/FunctionalSpec`](../../commands/FunctionalSpec.md) command. That file holds the slash-command entry point and Hard Gate; this file holds the complete procedure.

> **Governance:** Read [.claude/shared/AI_Behavior_Governance.md](../../shared/AI_Behavior_Governance.md) in full before this skill. Its rules take priority over anything below.

> **Logging (mandatory):** After the artifact is saved and agreed, apply [.claude/shared/Execution_Logging.md](../../shared/Execution_Logging.md).

> **Versioning (mandatory):** Before starting work on an existing requirement, check [.claude/shared/Versioning_Policy.md](../../shared/Versioning_Policy.md) — if every document for this requirement is already Frozen/Approved/Complete from `/Scope` through `/Testing`, ask whether this should be raised as Version 2 before editing anything.

## When to Use
- The user invokes `/FunctionalSpec` for a specific Object ID (the requirement's frozen Requirement ID — see Object ID Rule below) from the Solution Architect write-up's "What Will Be Built" table.
- Defining exact expected business behavior for the requirement's object(s), precise enough for a developer to build without guessing.
- Preparing the FS that `/TechnicalSpec` will consume.

## Object ID Rule (framework-wide default)
The Object ID used to name this document (`FunctionalSpec_<ObjectID>.md`) is the requirement's frozen **Requirement ID** (e.g. `SALES-RPT-001`) — never a technical-style or per-RICEFW-row ID. If the Solution Architect write-up's "What Will Be Built" table lists multiple RICEFW rows for this requirement, document all of them together in this **one** FS, under this **one** Object ID — give each row its own clearly labeled section/component inside the document (Sections 3–9 can repeat per component where the answers genuinely differ) rather than producing a separate FS per row. Never invent or accept a Z-style/technical-looking Object ID for tracking purposes.

**No technical/custom object names anywhere in this document — not even in passing.** This applies to every field, including free-text ones like Version History change summaries, Section 2 narrative, and Section 10 notes — not just the Document Control "Object ID" field. If a technical/custom name was discussed or superseded during this session (e.g., a rejected draft Object ID), describe the change in plain, non-technical terms (e.g., "combined into one Functional Spec under the Requirement ID") rather than naming the rejected technical identifier. Standard SAP object references that are genuinely known facts (Section 6a/6b — existing tables, BAPIs, IDocs, transactions) remain the one allowed exception, per the Boundary Rule above.

## Purpose
Generate a **Functional Specification (FS) Document** for a requirement — covering every RICEFW object listed for it — from the **Solution Architect write-up** (`/SolutionArchitect`) and, where needed, the **BRD** (`/Scope`).

Define the exact expected business behavior for the object — precise enough for a developer to build without guessing, with **zero implementation detail** and **technology-independent** language. Before designing anything new: assess reuse, confirm entry criteria, then document business requirements, testing conditions, and error handling.

**Gate to next phase:** FS frozen and saved (Freeze Confirmation, Step 5).

## Boundary Rule (enforce — not a blanket ban on technical terms)
Only one kind of "technical" reference belongs in the FS.

| Type | Belongs in FS? | Example |
|---|---|---|
| **Standard SAP object as a known fact** (existing table, standard BAPI, IDoc type, transaction) | ✅ Yes | "Validate against table `KNA1`"; "Use `BAPI_SALESORDER_CREATEFROMDAT2`"; "IDoc `ORDERS05`" |
| **New/custom build decision** — which BAdI/enhancement/user-exit; new Z-table/structure schema; exception class or message class/number design; OData/entity modeling; performance tuning (indexing/buffering/parallelization); actual ABAP/UI5 pseudo-code | ❌ No — park it in Section 10 (Technical Spec Input Notes) | Which enhancement spot injects the check; new Z-table fields |

**Test to apply:** is this an *existing SAP object referenced as fact*, or *deciding how something new will be built*? Former → FS body. Latter → Section 10, for `/TechnicalSpec`.

## Cross-Cutting Concerns (apply across ALL phases, not one phase alone)
| Concern | How it shows up per phase |
|---|---|
| **Traceability** | BRD ID → Architecture object entry → FS section → TS mapping table → Test case → TR → Go-live confirmation. Every object should be traceable end to end. |
| **Governance** | Steering committee reviews, RAID log (Risks, Assumptions, Issues, Dependencies) maintained continuously. |
| **Security & Authorization** | High-level at Architecture → business rules at FS → technical auth objects at TS → validated in UAT and hypercare. |
| **Data Privacy/Compliance** | Checked at Functional Design (what data is touched) and Testing (masked data usage). |
| **Documentation Discipline** | Each phase's output becomes the next phase's fixed input — no phase should redesign what a prior phase already froze without a formal change process. |

## Workflow
1. **Entry Criteria & Reuse Assessment** — confirm before any design work.
2. **Source Discovery** — locate the Solution Architect write-up (and BRD/gap-analysis notes if needed).
3. **Context Pull** — extract everything already known; no questions yet.
4. **Ask the User** — gather only genuine gaps, grouped by concern.
5. **Freeze Confirmation** — summarize and get explicit confirmation.
6. **Generate the FS Document** — using the fixed template.
7. **Save to Artifacts** — persist the frozen document.
8. **Handoff** — point to `/TechnicalSpec`.

## 1. Entry Criteria & Reuse Assessment
Confirm all of the following before design begins — do not silently assume:

- ☐ **Reuse assessed** — does SAP offer this via standard transactions/functionality? Has this WRICEFW been built before at another system (e.g., GSAP, AluSAP)? Some answers may need a technical designer's input — flag rather than guess. Full/partial reuse reduces design scope; if the outcome is a gap, note it briefly in Section 2 (Business Process Overview).
- ☐ **Gap analysis** performed and resolution documented.
- ☐ **Related BRD** completed.
- ☐ **Design owner** identified.

If any box can't be confirmed, ask the user directly. If they choose to proceed anyway, log the gap in Assumptions & Dependencies (Section 10) as a risk.

> Configuration changes can shift FS scope/timeline — flag any raised during this discussion in the Configuration Commitments tracker (Section 10). Once frozen, further changes need an approved scope change request — make the user aware of this up front.

## 2. Source Discovery
- Look in `Artifacts/` for the linked Solution Architect write-up (`SolutionArchitect_<name>.md`), the BRD (`BRD_<name>.md`) if needed, and any gap-analysis/prior-build notes relevant to Step 1.
- Multiple write-ups found → ask which requirement (Requirement ID) this FS is for. Per the Object ID Rule above, all RICEFW rows for that one requirement are documented together — there is no separate "which Object ID" question once the requirement is identified.
- **None found → Backward Dependency Check:** do not just tell the user to go run `/SolutionArchitect` manually. Instead: (1) tell the user the Solution Architect write-up is missing and that you're switching to `/SolutionArchitect` now to generate it; (2) run the full `/SolutionArchitect` flow inline (which itself will cascade back to `/Scope` if the BRD is also missing) until the write-up is saved and agreed; (3) once confirmed, automatically resume this `/FunctionalSpec` flow from this step using the newly created write-up — the user does not need to re-invoke the command.

## 3. Context Pull (no questions yet)
Before asking the user anything:

1. From the Solution Architect write-up, extract: Requirement ID (this FS's Object ID), Object Name(s), RICEFW Type(s), Chosen Approach, and confirmed prerequisites/versions (System Details, Prerequisites & Configurations) — for every row in "What Will Be Built" belonging to this requirement.
2. From the linked BRD, extract the originating business requirement.
3. Pre-fill every field with a known answer. Only ask the user about genuine gaps.

## 4. Ask the User (only what's missing)
**Don't re-ask:** skip anything already extracted in Context Pull (Step 3), already stated in the Solution Architect write-up/BRD, or already given by the user earlier in this conversation — including in an earlier group below. Cross-check before asking.

Ask in short batches, not a 20-question wall. Suggested groupings:

**A. Trigger & Process**
- What triggers this object? (user action, background job, inbound IDoc/API call, etc.)
- Which business process/step does it belong to?

**B. Input**
- What are the input fields/parameters?
- Which are mandatory vs optional?
- Where does each input value come from (manual entry / another SAP object / external system)?

**C. Business Rules**
- What validations must happen, spelled out completely with pass/fail conditions, and what should occur when they fail (error, warning, block, log)?
- Any calculations or derivations (state the *business formula*, not the technical lookup)?

**D. Output**
- What should the output look like (report layout, form, confirmation message, updated record)?
- Any sorting, grouping, totals, or formatting expectations?
- What is the exact list/end-to-end navigation: every screen the user sees from entry point to final result, and what happens at each step (including success/failure feedback)?
- For each screen, the exact columns/fields to display, in order — not just "key fields" or a generic layout description.

**E. Authorization**
- Who should be able to use/see this (roles, org-level restrictions)?

**F. Non-Functional (business-level only)**
- Expected volume (rough record counts)?
- Frequency (real-time / batch / on-demand)?
- Any SLA expectation from the business (e.g., "must complete within 2 minutes")?

**G. SAP Mapping (where do the data elements live?)**
- Which SAP transaction(s)/screen(s) contain or expose each key data element?
- Which master table(s)/field(s) store each key data element, referenced as standard SAP facts with both business name and technical name (never a Z-object name)? (If genuinely unknown, note it as a question for the technical designer rather than guessing.)
- Which master tables must be joined to produce the output, and what is the join condition between them, stated as a business key (e.g., "same Transfer Order Number and Warehouse Number") plus the technical join fields, not just table names in isolation?
- Gather this from: review of associated Process Detailed Designs, discussion with process team leads/SMEs/key users, and discussion with existing system developers or system/process architects.

**H. Business Impact & Change Management**
- Which user roles/groups are affected by this change?
- What is the business impact if this object is not delivered or behaves differently than expected?
- Any change management considerations (training, communication) this raises?

**I. Error Handling (detailed)**
- What potential functional errors can occur (e.g., "material type not found", "posting period closed")?
- For each error, is it a **Warning**, an **Error**, or a **Fatal error (abend)**?
- Notification strategy for fatal/non-fatal errors (SAP Inbox, Open Mail, standard messaging queue, Workflow, error report)?
- Who should be notified for each error (notification matrix)?
- Does any error require a dedicated error report? (If yes, note it needs its own "Report Functional Specs" design template.)

**J. Test Scenarios**
- 2–3 key positive scenarios
- 2–3 key negative/edge scenarios and expected results
- Note: master/transactional test data to satisfy these scenarios doesn't have to be finalized when the FS is completed, but must be provided before component test execution — capture who owns providing it.

**Self-check before finalizing:** apply the Boundary Rule test above to every technical mention. Standard SAP object as a known fact → fold into Section 6/6a/5. New-build decision → don't include it in the FS body; log it in Section 10 instead:

  > "Noted — that's an implementation decision rather than a known standard reference. I've added it to the Technical Spec Input Notes for `/TechnicalSpec` to pick up."

## 5. Freeze Confirmation (before generating final doc)
Before generating the final FS document, summarize what has been gathered and get explicit confirmation from the user. For complex objects, recommend a review workshop with business stakeholders to validate understanding before freezing. Use clear status indicators so gaps are visually obvious:

```
✅  Entry criteria (reuse, gap analysis, BRD, design owner) — confirmed
✅  Business process & trigger        — confirmed
✅  Input fields                      — confirmed
✅  Business rules / validations      — confirmed
⚠️  Output layout                     — partially defined, please confirm sort order
✅  SAP data mapping                  — confirmed
⚠️  Error handling                    — errors listed, notification matrix pending
❌  Test scenarios                    — not yet provided
❌  Open issues                       — must be resolved before freezing
```

- ✅ Green check = confirmed, ready to freeze
- ⚠️ Yellow = partially answered, will proceed with assumption unless corrected
- ❌ Red = missing, must be answered before freeze (block finalization if this is a core section: Business Rules, Input, or Output)

Ask: **"Ready to freeze this Functional Spec? (yes / edit a section)"**
Do not generate the final document until the user confirms, unless they explicitly say to proceed with assumptions.

## 6. Generate the FS Document
Use this exact structure so `/TechnicalSpec` can reliably reference sections by heading:

```markdown
# Functional Specification

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | (the requirement's Requirement ID — see Object ID Rule above; never a technical-style ID) |
| Object Name | |
| RICEFW Type | (list all types covered if this requirement has multiple RICEFW rows, e.g. "Interface + Custom Object") |
| Linked BRD Ref | |
| Linked Solution Architect Ref | |
| Author | |
| Version | |
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | | | Initial creation | |

## 2. Business Process Overview
(plain language description)

## 2a. Business Impact & Affected Users
(affected roles/user groups, business impact if not delivered, change management considerations — feeds Change Management effort)

## 3. Object Type & Purpose

## 4. Trigger / Entry Point

## 5. Input Specification
| Field | Mandatory? | Source | Default Value |
|---|---|---|---|

## 6. Business Rules / Processing Logic
| # | Rule Type (Validation/Calculation/Derivation) | Business Rule | Condition | Result / Action on Fail (Error/Warning/Block/Log) |
|---|---|---|---|---|

## 6a. Reference Objects (Standard SAP)
> Existing standard SAP objects this logic depends on — known facts, not build decisions.

| Object Type | Object Name | Purpose in this process |
|---|---|---|
| Table | e.g. KNA1 | Customer status check |
| BAPI/FM | e.g. BAPI_SALESORDER_CREATEFROMDAT2 | Order creation |
| IDoc Type | e.g. ORDERS05 | Inbound order data |
| Transaction | e.g. VA01 | Reference process transaction |

## 6b. SAP Data Mapping
> Where each key business data element lives in SAP — maps business requirements to transactions/screens and, where known, master tables/fields. Reference standard SAP tables/fields as known facts (never a Z-object name), giving both the business name and the technical name; flag anything unconfirmed for the technical designer.

**Master Table Join Conditions**
| Master Table (Business Name) | Technical Table Name | Business Purpose | Joins To | Join Condition (Business Key) | Technical Join Fields | Cardinality |
|---|---|---|---|---|---|---|

**Field-Level Data Mapping**
> Every column that appears in the final output (Section 7), mapped to its source — no column left unmapped.

| Output Column | Source Table (Business Name) | Technical Table Name | Source Field (Business Name) | Technical Field Name | Header/Item Level | Derivation Rule |
|---|---|---|---|---|---|---|

## 7. Output Specification
> Describe the complete end-to-end navigation from entry point to final result — every screen the user sees, and what happens at each step.

**Screen-by-Screen Navigation**
1. (Entry screen — how the user arrives, what's shown by default)
2. (Each subsequent screen/action, including confirmation dialogs, success/failure feedback, and where the user ends up)

**Exact Columns/Fields Displayed (per screen)**
| Screen | Column/Field | Display Order | Sort/Grouping |
|---|---|---|---|

## 8. Error Handling & Messages
| # | Potential Error | Error Type (Warning/Error/Fatal) | Notification Strategy | Notify Whom | Error Report Needed? |
|---|---|---|---|---|---|

> Error Report Needed = Yes items must each be defined using a separate "Report Functional Specs" design template; list them below.

## 8a. Error Reports Required
| Error Report Name | Linked Error(s) | Status |
|---|---|---|

## 9. Authorization Requirements

## 10. Assumptions, Dependencies & Technical Spec Input Notes

### Configuration Commitments Tracker
> Track configuration decisions that affect FS content/timeline; functional team member is responsible for monitoring and flagging milestone deviations to the project team.

| Configuration Item | Commitment/Decision | Owner | Milestone Impact |
|---|---|---|---|

### Technical Spec Input Notes
> Implementation hints mentioned during this discussion, parked for /TechnicalSpec.
- (e.g., "mentioned BAdI XYZ" / "mentioned table ZTABLE1")

## 11. Test Scenarios (UAT-level)
| # | Scenario | Type (Positive/Negative) | Expected Result |
|---|---|---|---|

### Test Data Requirements
> Master/transactional data needed to satisfy the scenarios above. Not required to be finalized at FS completion, but must be provided before component test execution.

| Data Needed | Master/Transactional | Owner | Required By |
|---|---|---|---|

---
**Next step:** Run `/TechnicalSpec` referencing this document (Object ID: ___) to generate the Technical Specification.
```

## 7. Save to Artifacts
- Ensure the `Artifacts/` folder exists; create it if missing.
- Save the frozen document as `FunctionalSpec_<ObjectID>.md`, where `<ObjectID>` is the requirement's Requirement ID (per the Object ID Rule above) — in `Artifacts/`.
- Confirm the saved file path to the user.
- If the user later requests edits, apply them, overwrite the same file (no duplicates), and briefly summarize what changed.

## 8. Handoff Message (end of command output)
After generating and saving the doc, end the response with:

> ✅ **Functional Spec frozen for [Object ID – Object Name].**
> 👉 Next command: **`/TechnicalSpec`** — this will use this FS to define the actual technical build approach (code objects, tables, BAdIs, OData services, etc.).

## Guardrails Summary

| Do | Don't |
|---|---|
| Assess reuse and confirm Entry Criteria before designing | Ask "which BAdI/enhancement will you use" (that's a build decision) |
| Capture business validation rules | Write pseudo-code or actual logic |
| Reference standard SAP tables/BAPIs/IDocs/transactions as known facts (Section 6a) | Design new Z-table schemas, exception classes, or OData models |
| Give the exact output columns per screen and master table join conditions (business key, not just table names) in Sections 6b/7 | Leave output as a vague layout description with no column-to-source mapping |
| Describe the full end-to-end navigation (every screen, every step) in Section 7 | Describe only the first/main screen and skip confirmation, success, and failure steps |
| Reference the Solution Architect write-up's object list | Redefine RICEFW type or approach (that's frozen upstream) |
| Flag *new-build* technical mentions to Section 10 | Flag standard SAP object references as if they don't belong |
| Capture every business rule as its own row in the Section 6 table (Rule Type, Condition, Result/Action on Fail) | Collapse multiple distinct rules into one paragraph/bullet |
| Classify every error as Warning/Error/Fatal with a notification matrix | Leave error handling as a vague "show an error message" |
| Resolve every issue raised before freezing | Allow open issues to remain at freeze |
| Require explicit user confirmation before freezing | Auto-freeze without user confirmation |
