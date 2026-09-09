---
name: testing
description: 'Full procedure for the /Testing command (Phase 6: Testing). Use when executing Component Test, SIT, String/Cycle, UAT, Regression, Performance, and Security testing for an object built in /Code, producing a Test Document. Gate before Deployment/Go-Live. Invoked by the /Testing command.'
---

# Testing Skill — SAP Testing Phase Assistant (Phase 6: Testing)

> Invoked by the [`/Testing`](../../commands/Testing.md) command. That file holds the slash-command entry point and Hard Gate; this file holds the complete procedure.

> **Governance:** Read [.claude/shared/AI_Behavior_Governance.md](../../shared/AI_Behavior_Governance.md) in full before this skill. Its rules take priority over anything below.

> **Logging (mandatory):** After the artifact is saved and agreed, apply [.claude/shared/Execution_Logging.md](../../shared/Execution_Logging.md).

> **Versioning (mandatory):** Before starting work on an existing requirement, check [.claude/shared/Versioning_Policy.md](../../shared/Versioning_Policy.md) — if every document for this requirement is already Frozen/Approved/Complete from `/Scope` through `/Testing`, ask whether this should be raised as Version 2 before editing anything.

## When to Use
- The user invokes `/Testing` for an Object ID (the requirement's frozen Requirement ID — see Object ID Rule below) with a completed Build & Unit Test Record.
- Running Component Test review, SIT, String/Cycle, UAT, Regression, Performance, and Security testing.
- Producing the shared `Test_Document.md` and obtaining UAT sign-off before Deployment/Go-Live.

## Object ID Rule (framework-wide default)
The Object ID identifying this test round is the same Requirement ID already used by the linked Build/TS/FS — never a technical-style ID. If that requirement covered multiple RICEFW components, test them together under this one Object ID's section in `Test_Document.md`.

## Purpose
Validate that the object built in `/Code` works correctly — both in isolation and within the broader business process — using real business scenarios. Runs Component Test execution/review, then System Integration Testing (SIT), String/Cycle Testing, User Acceptance Testing (UAT), Regression Testing, Performance/Load Testing, and Security Testing, closing with a defect log and formal UAT sign-off.

**Gate to next phase:** UAT sign-off obtained, no open Critical/High defects (Section 12).

## Boundary Rule
| Belongs here? | Content |
|---|---|
| ✅ Yes | Test execution against pre-defined FS/TS/Component Test Plan cases (traceable back to those documents); defect logging with severity/priority classification; formal UAT sign-off documentation; regression evidence |
| ❌ No | Ad hoc testing without pre-written test cases for critical objects; skipping UAT sign-off and moving straight to deployment; testing with unmasked production data (data privacy risk); silently changing scope to fix a defect (this must trigger a change request via the Issue & Change Escalation process instead) |

## Cross-Cutting Concerns (apply across ALL phases, not one phase alone)
| Concern | How it shows up per phase |
|---|---|
| **Traceability** | BRD ID → Architecture object entry → FS section → TS mapping table → Test case → TR → Go-live confirmation. Every object should be traceable end to end. |
| **Governance** | Steering committee reviews, RAID log (Risks, Assumptions, Issues, Dependencies) maintained continuously. |
| **Security & Authorization** | High-level at Architecture → business rules at FS → technical auth objects at TS → validated in UAT and hypercare. |
| **Data Privacy/Compliance** | Checked at Functional Design (what data is touched) and Testing (masked data usage). |
| **Documentation Discipline** | Each phase's output becomes the next phase's fixed input — no phase should redesign what a prior phase already froze without a formal change process. |

## Workflow
1. **Entry Criteria & Test Environment Setup** — confirm the build is test-ready and the QA/UAT client is ready.
2. **Source Discovery** — locate the Build & Unit Test Record (and TS/FS if needed).
3. **Context Pull** — extract the Component Test Plan and UAT scenarios; no questions yet.
4. **Conduct Component Test & Review** — execute, peer-review, and sign off before broader testing.
5. **Ask the User** — gather only genuine test-cycle details, grouped by concern.
6. **Execute Test Cycles** — SIT → String/Cycle → UAT → Regression → Performance → Security.
7. **Freeze Confirmation** — summarize and get explicit sign-off.
8. **Generate the Test Document** — using the fixed template.
9. **Save to Artifacts** — persist the document.
10. **Handoff** — point to Deployment/Go-Live.

## 1. Entry Criteria & Test Environment Setup
Confirm before testing begins — do not silently assume:

- ☐ The Build & Unit Test Record is complete (code review passed, unit tests passed, transport ready for QA import — `/Code`'s gate).
- ☐ The Component Test Plan is finalized (Build record Section 9 / TS Section 12a).
- ☐ A QA/UAT client is available with realistic, masked/anonymized data — never raw production data.

If unmet, flag it back to the user and recommend resolving it in `/Code` first.

## 2. Source Discovery
- Look in `Artifacts/` for the linked Build & Unit Test Record (`Build_<ObjectID>.md`) and, if needed, the Technical Spec (`TechnicalSpec_<ObjectID>.md`) and Functional Spec (`FunctionalSpec_<ObjectID>.md`).
- Multiple builds found → ask which requirement (Requirement ID) this test round is for.
- **None found → Backward Dependency Check:** do not just tell the user to go run `/Code` manually. Instead: (1) tell the user the Build & Unit Test Record is missing and that you're switching to `/Code` now to generate it; (2) run the full `/Code` flow inline (which itself will cascade back to `/TechnicalSpec`/`/FunctionalSpec`/`/SolutionArchitect`/`/Scope` if those are also missing) until the build record is saved; (3) once confirmed, automatically resume this `/Testing` flow from this step using the newly created build record — the user does not need to re-invoke the command.

## 3. Context Pull (no questions yet)
Before asking the user anything:

1. From the Build record, extract: Objects Built (Section 3), Component Test Plan (Section 9), transport details (Section 10).
2. From the linked FS, extract the UAT test scenarios (Section 11) and business rules (Section 6) for traceability.
3. From the linked TS, extract the FS-rule-to-technical mapping (Section 5) to confirm test coverage.
4. Pre-fill every field that can be reasonably derived. Only ask the user about genuine gaps.

## 4. Conduct Component Test & Review
**Component Test Execution** — performed by the programmer who coded the object. Cover, at minimum:
- Selection criteria validation
- Negative vs. positive values
- Select statements (e.g. select single) — checking return code `sy-subrc`
- WHERE clauses (all components)
- Read statements — checking return code `sy-subrc`
- Extract statements (for datasets)
- Clear statements — proper timing
- Assignment statements
- Table loops — endless loops and efficiency
- Verifying all PERFORMs' and function modules' functionality
- User interfaces (push buttons, line selection)
- Output layouts, including paper printouts
- Online documentation

Flag any configuration anomaly to the functional team member **immediately**. Document results thoroughly — this record is also the basis for future regression testing.

**Code & Component Test Review** — conducted by a peer/technical designer/lead (not the author), against the Code Review Checklist (Appendix A); reviewers verify the program satisfies technical requirements and performance considerations. The reviewer also checks:
- How each design specification will be tested
- Test cycles and cycle scripts
- Sufficient test data created to cover all conditions
- Test data is representative of real business data (confirmed with the functional designer)
- Performance

Annotate any item requiring rework on the Issues Log. Once passed, the reviewer signs off on **both** the Code Review Checklist and the Component Test Plan Review Checklist — the object is then ready to proceed to SIT and broader testing.

**If a spec-impacting issue surfaces** during component test or review, don't decide it alone — follow the Issue & Change Escalation process: review with the technical designer, onsite development coordinator, and development lead (looping in the functional designer where necessary); establish what changes are needed, when, the schedule impact, and the budget impact; log it on the Issues Log rather than silently changing scope.

## 5. Ask the User (only what's missing)
**Don't re-ask:** skip anything already extracted in Context Pull (Step 3), already covered in the Component Test Plan/FS/TS, or already given by the user earlier in this conversation — including in an earlier group below. Cross-check before asking.

Ask in short batches, grouped by concern:

**A. System Integration Testing (SIT)**
- Which full process flow(s) will this object be tested within (not in isolation)?
- Which other modules/interfaces/systems does it integrate with?
- Defect severity scheme in use (Critical/High/Medium/Low)?

**B. String/Cycle Testing**
- Which full end-to-end business process cycle(s) include this object (e.g., full Procure-to-Pay)?

**C. User Acceptance Testing (UAT)**
- Which FS UAT scenarios (Section 11) will business users execute, and in which QA/UAT client?
- Confirm test data is realistic and masked/anonymized.
- Who provides the formal business sign-off?

**D. Regression Testing**
- Which existing functionality/processes need regression coverage?
- Manual, or automated (e.g., Tricentis Tosca, Worksoft, SAP Test Automation Tool)?

**E. Performance/Load Testing** *(if applicable — high-volume interfaces/batch jobs)*
- Expected vs. peak load and performance criteria (from the TS)?

**F. Security Testing**
- Which roles/authorization scenarios will be validated using actual restricted test users (not `SAP_ALL`)?

**Self-check before finalizing:** if fixing a defect would require changing scope beyond what the FS/TS defined, stop — that's a change request, not a silent fix. Follow the Issue & Change Escalation process in Section 4.

## 6. Execute Test Cycles
Run in sequence. Log every defect with a severity/priority classification, fix it, and retest before moving on:

1. **SIT** — test the object within the full process flow; validate integration with other modules/interfaces/systems.
2. **String/Cycle Testing** — execute the full end-to-end business process cycle including this object.
3. **UAT** — business users execute the FS's UAT scenarios in the QA/UAT client with masked data; obtain formal business sign-off (critical go/no-go gate).
4. **Regression Testing** — confirm existing functionality is unaffected; capture evidence (manual results or automation tool output).
5. **Performance/Load Testing** — where applicable, test high-volume interfaces/batch jobs under expected and peak load.
6. **Security Testing** — validate authorization checks with actual restricted test users.

## 7. Freeze Confirmation (before generating final document)
Summarize with clear status indicators before generating the final document:

```
✅  Component test executed & reviewed  — confirmed, signed off
✅  SIT                                 — confirmed, no open defects
✅  String/Cycle testing                — confirmed
⚠️  UAT                                 — executed, sign-off pending
✅  Regression testing                  — confirmed, evidence captured
✅  Performance/Load testing            — confirmed (or N/A)
✅  Security testing                    — confirmed
❌  Defect log                          — 1 open Critical defect
```

- ✅ Green check = confirmed, ready to freeze
- ⚠️ Yellow = partially answered, will proceed with a stated assumption unless corrected
- ❌ Red = missing or blocking — must be resolved before freeze if it's a core section (Component Test, UAT sign-off, or any open Critical/High defect)

Ask: **"Ready to finalize the Test Document? (yes / edit a section)"**
Do not generate the final document until confirmed, unless the user explicitly says to proceed with assumptions.

## 8. Generate the Test Document

```markdown
# Test Document

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | |
| Object Name | |
| Linked Build & Unit Test Record Ref | |
| Linked Technical Spec Ref | |
| Linked Functional Spec Ref | |
| Tester(s) | |
| Version | |
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | | | Initial creation | |

## 2. Component Test

### 2a. Component Test Execution
| Key Area | Test Condition | Result |
|---|---|---|
| Selection criteria validation | | |
| Negative vs. positive values | | |
| Select statements (`sy-subrc`) | | |
| WHERE clauses (all components) | | |
| Read statements (`sy-subrc`) | | |
| Extract statements | | |
| Clear statements | | |
| Assignment statements | | |
| Table loops (endless loops/efficiency) | | |
| PERFORMs/function modules | | |
| User interfaces (push buttons, line selection) | | |
| Output layouts (incl. paper printouts) | | |
| Online documentation | | |

### 2b. Code & Component Test Review
| Reviewer | Review Item | Findings | Status |
|---|---|---|---|

| Checklist | Status |
|---|---|
| Code Review Checklist (Appendix A) signed off | ⬜ Pending |
| Component Test Plan Review Checklist signed off | ⬜ Pending |

## 3. System Integration Testing (SIT)
| Process Flow / Integration Point | Result | Defect Ref (if any) |
|---|---|---|

## 4. String/Cycle Testing
| Business Process Cycle | Steps Executed | Result |
|---|---|---|

## 5. User Acceptance Testing (UAT)
| FS Scenario Ref (Section 11) | Executed By | Result |
|---|---|---|

| Sign-off | Status |
|---|---|
| Business Owner (UAT) | ⬜ Pending |

## 6. Regression Testing
| Existing Functionality Tested | Method (Manual/Automated + Tool) | Result |
|---|---|---|

## 7. Performance/Load Testing
| Scenario | Expected Load | Peak Load | Result |
|---|---|---|---|

## 8. Security Testing
| Role/Scenario | Test User | Result |
|---|---|---|

## 9. Defect Log
| Defect ID | Description | Severity | Status | Resolution |
|---|---|---|---|---|

## 10. Assumptions & Dependencies

## 11. Issues Log (spec changes raised during testing)
| Issue ID | Description | Resolution | Schedule Impact | Budget Impact | Status |
|---|---|---|---|---|---|

## 12. Sign-off
| Role | Name | Status |
|---|---|---|
| Tester/Programmer | | ✅ Approved |
| Peer Reviewer / Technical Designer | | ⬜ Pending |
| Development Lead | | ⬜ Pending |
| Business Owner (UAT) | | ⬜ Pending |

---
**Next step:** Proceed to Deployment/Go-Live for Object ID: ___, using this Test Document as evidence.
```

## 9. Save to Artifacts
- Ensure the `Artifacts/` folder exists; create it if missing.
- Save the document as the single file `Test_Document.md` in `Artifacts/` — exactly one document per command run, never multiple files.
- If `Test_Document.md` already exists for a **different** Object ID, ask the user for confirmation, then append a new section to that same file — never create a second file for it.
- Confirm the saved file path to the user.
- If the user later requests edits, apply them, overwrite the same file (no duplicates), and briefly summarize what changed.

## 10. Handoff Message (end of command output)
After generating and saving the document, end the response with:

> ✅ **Test Document finalized for [Object ID – Object Name].**
> 👉 Next step: **Deployment/Go-Live**, using this Test Document as evidence. Gate: UAT sign-off obtained, no open Critical/High defects.

## Guardrails Summary

| Do | Don't |
|---|---|
| Execute Component Test against the full key-area checklist before broader testing | Skip component test areas (e.g., `sy-subrc` checks, table loop efficiency) |
| Flag configuration anomalies to the functional team member immediately | Silently work around a configuration gap |
| Get Code Review + Component Test Plan Review sign-off before proceeding to SIT | Move to SIT/UAT without both reviews signed off |
| Test against pre-defined FS/TS/Component Test Plan cases, traceable back to those documents | Rely on ad hoc testing for critical objects |
| Test SIT, String/Cycle, Regression, Performance, and Security as applicable | Skip a testing type without recording why it's not applicable |
| Use masked/anonymized data in QA/UAT | Test with unmasked production data |
| Obtain formal UAT sign-off from the Business Owner before deployment | Skip UAT sign-off and move straight to deployment |
| Log every defect with severity/priority, fix it, and retest | Leave Critical/High defects open at sign-off |
| Escalate spec-impacting issues via the Issue & Change Escalation process (technical designer, onsite dev coordinator, development lead, functional designer as needed) | Silently change scope to fix a defect — raise a change request instead |
| Require explicit freeze confirmation before generating the final Test Document | Auto-freeze without user confirmation |
