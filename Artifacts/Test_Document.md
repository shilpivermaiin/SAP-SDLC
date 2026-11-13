# Test Document

> **Status: In Progress (Draft).** Not frozen. UI-level cycles (SIT, UAT) have not been executed yet; see Sections 3 and 5.

## PS-APP-001 — Project & RFP Effort Management

### 1. Document Control
| Field | Value |
|---|---|
| Object ID | PS-APP-001 |
| Object Name | Project & RFP Effort Management (Fiori App) |
| Linked Build & Unit Test Record Ref | [Build_PS-APP-001.md](Build_PS-APP-001.md) (v1.5) |
| Linked Technical Spec Ref | [TechnicalSpec_PS-APP-001.md](TechnicalSpec_PS-APP-001.md) (v1.2) |
| Linked Functional Spec Ref | [FunctionalSpec_PS-APP-001.md](FunctionalSpec_PS-APP-001.md) (v1.2) |
| Tester(s) | ankur.gupta04@nagarro.com (Technical Consultant / Developer; also acting as Business Owner for UAT) |
| Test system | PS4, client 110 (DEV). No separate QA/UAT client was used, by the user's decision. Transport PS4K902111 is released; its import into QA has not been confirmed. |
| App URL | https://sapdev.nagarro.com:44300/sap/bc/ui5_ui5/sap/zps_rfpeffort/index.html?sap-client=110 |
| Version | 0.1 |

#### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 0.1 | 2026-11-13 | ankur.gupta04@nagarro.com | Initial creation. Component tests re-run in DEV; SIT and UAT scripts prepared but not executed (the browser UI cannot be driven from the AI session). | In Progress |

### 2. Component Test

#### 2a. Component Test Execution
| Key Area | Test Condition | Result |
|---|---|---|
| Selection criteria validation | Module, phase and entry type are validated server-side | ✅ Unit tests `test_invalid_value_validation`, `test_mandatory_validation` passed (2026-11-13 re-run) |
| Negative vs. positive values | Negative effort, negative cost, negative rate rejected; positive accepted | ✅ `test_effort_negative_blocked`, `test_cost_negative_blocked`, `test_bo_negative_effort`, `test_negative_rate`, `test_valid_rate_passes` passed |
| Select statements (`sy-subrc`) | Only two `FOR ALL ENTRIES` reads, each behind an empty-table guard | ✅ Covered by `test_bo_item_autocalc` and `test_bo_item_no_rate`; reviewed in Build record section 4 |
| WHERE clauses (all components) | Rate lookup on Module + Role | ✅ `test_cost_autocalc_with_rate`, `test_cost_blank_when_no_rate`, `test_stale_cost_cleared`, `test_rate_without_currency` passed |
| Read statements (`sy-subrc`) | Header lookup for the "Won" check on actual lines | ✅ `test_bo_actual_needs_won`, `test_bo_actual_after_won` passed |
| Extract statements | Not used in this object | N/A: RAP business object, no datasets |
| Clear statements | Stale cost cleared when the rate no longer applies | ✅ `test_stale_cost_cleared` passed |
| Assignment statements | Header defaults (status Estimate, owner) and item currency copied from the rate | ✅ `test_bo_header_defaults`, `test_rate_without_currency` passed |
| Table loops (endless loops/efficiency) | Dashboard aggregation is pushed down in CDS (`SUM`/`GROUP BY`) | ✅ By design review (Build record section 4); dashboard view reads the database without error and returns no rows (tables empty) |
| PERFORMs/function modules | None used; logic sits in local helper classes | N/A; helper classes covered by the 22 unit tests |
| User interfaces (push buttons, line selection) | List, create, add line, Mark as Won, delete, dashboard, rate master | ⬜ Not executed on the deployed app; previewed against a mock backend only (Build record section 12, I-09, I-13, I-14). See SIT script in Section 3. |
| Output layouts (incl. paper printouts) | No printing in scope; dashboard spreadsheet export | ⬜ Export not executed on the deployed app (Build record section 9, row 8) |
| Online documentation | None specified in the FS or TS | N/A |

**Unit-test re-run (2026-11-13, SAPDiagnose, PS4 / 110):** `ZBP_I_PSEFFRTHDR` 18 of 18 passed; `ZBP_I_PSEFFRTRATE` 4 of 4 passed; 0 failures, 0 errors, 0 skipped. Total 22 of 22.

#### 2b. Code & Component Test Review
| Reviewer | Review Item | Findings | Status |
|---|---|---|---|
| Not yet assigned (peer / technical lead) | Code review, test design, test data, performance | — | ⬜ Pending |

| Checklist | Status |
|---|---|
| Code Review Checklist (Appendix A) signed off | ⬜ Pending (no peer reviewer assigned) |
| Component Test Plan Review Checklist signed off | ⬜ Pending (no peer reviewer assigned) |

### 3. System Integration Testing (SIT)
The app is standalone: it reads and writes only its own three tables through its two OData V4 services. There are no interfaces to other modules or systems.

| Process Flow / Integration Point | Result | Defect Ref (if any) |
|---|---|---|
| Deployment check: manifest serves, app ID `zps.rfpeffortmgmt` (HTTP 200, 2026-11-13) | ✅ Passed | — |
| Service check: both OData V4 `$metadata` documents return; entity sets `RfpEffort`, `RfpEffortItem`, `EffortDashboard`, `RoleValueHelp`, `CostRate` are exposed (2026-11-13) | ✅ Passed | — |
| App flow F1: List → Create RFP → Detail → add estimate line (cost auto-calculated) | ⬜ Not executed | — |
| App flow F2: Detail → Mark as Won → Actuals tab appears → add actual line | ⬜ Not executed | — |
| App flow F3: Dashboard matrix and RFP summary, export to spreadsheet | ⬜ Not executed | — |
| App flow F4: Rate Master → add, change, delete a rate; value help in the line dialog shows the role | ⬜ Not executed | — |

### 4. String/Cycle Testing
N/A. The object is not part of a multi-module business process cycle; the app flows F1–F4 in Section 3 cover its own end-to-end path.

### 5. User Acceptance Testing (UAT)
Business Owner for UAT: ankur.gupta04@nagarro.com (by the user's decision). Test data must be sample/masked; no production data.

| FS Scenario Ref (Section 11) | Executed By | Result |
|---|---|---|
| 1. Create an RFP and add estimate lines with a matching rate (e.g. rate SD / Consultant = 100 USD, line SD / Prepare / 10 h) → expect cost 1,000 USD, status Estimate | — | ⬜ Not executed |
| 2. Mark an RFP as Won → expect status Won, Actuals tab available | — | ⬜ Not executed |
| 3. Log actuals with an activity description on a Won RFP → expect save, and the dashboard shows estimate vs. actual | — | ⬜ Not executed |
| 4. Enter negative effort → expect save blocked with an on-screen error | — | ⬜ Not executed |
| 5. Log actuals on an RFP still in Estimate → expect save blocked, message says it must be marked Won first | — | ⬜ Not executed |
| 6. Line with no matching rate → expect cost blank, non-blocking note, manual cost accepted | — | ⬜ Not executed |

Backend equivalents of scenarios 1–6 already pass as BO-level unit tests (Section 2a); UAT repeats them through the deployed UI.

| Sign-off | Status |
|---|---|
| Business Owner (UAT) | ⬜ Pending |

### 6. Regression Testing
| Existing Functionality Tested | Method (Manual/Automated + Tool) | Result |
|---|---|---|
| Existing Pre-Sales tracker and Genus Cost tables (Build record issue I-01) are not changed by this build | Structural check: transport PS4K902111 contents (2026-11-13) hold only the new `ZPS_EFFORT` objects and the `ZPS_RFPEFFORT` app; no existing table or program was modified | ✅ Structural check only; no behavioural regression run |

### 7. Performance/Load Testing
| Scenario | Expected Load | Peak Load | Result |
|---|---|---|---|
| N/A | The TS names no performance criteria and the app is not a high-volume interface or batch job | — | N/A. Dashboard aggregation is pushed down in CDS by design. |

### 8. Security Testing
| Role/Scenario | Test User | Result |
|---|---|---|
| Access by role assignment to the two services (`Z_PS_EFFORT_*` roles) | — | ⬜ Not tested. The PFCG roles were skipped by the user and do not exist yet; the custom authorization object was removed from scope (FS §9 v1.1, TS v1.2). |

### 9. Defect Log
| Defect ID | Description | Severity | Status | Resolution |
|---|---|---|---|---|
| — | No defects raised in this phase so far (UI cycles not executed) | — | — | — |

### 10. Assumptions & Dependencies
- Assumed (user decision): DEV client 110 serves as the test client; no separate QA/UAT client.
- Assumed (user decision): the developer also acts as Business Owner for UAT sign-off.
- Dependency: UI-level SIT (F1–F4) and UAT scenarios 1–6 must be executed by a person in the browser against the app URL in Section 1. The AI session has no route or login to the SAP host.
- Dependency: PFCG roles `Z_PS_EFFORT_*` must exist before security testing can be done with restricted users.
- Dependency: peer reviewer for the Code Review and Component Test Plan Review sign-offs.
- Known gap: ATC did not report the 7 CDS views, 2 service definitions and 2 service bindings (Build record I-16); they are covered by activation and by running the views against the database.
- Known item: Launchpad tile is not created.

### 11. Issues Log (spec changes raised during testing)
| Issue ID | Description | Resolution | Schedule Impact | Budget Impact | Status |
|---|---|---|---|---|---|
| — | None | — | — | — | — |

### 12. Sign-off
| Role | Name | Status |
|---|---|---|
| Tester/Programmer | ankur.gupta04@nagarro.com | ⬜ Pending (UI cycles not executed) |
| Peer Reviewer / Technical Designer | Not yet assigned | ⬜ Pending |
| Development Lead | Not yet assigned | ⬜ Pending |
| Business Owner (UAT) | ankur.gupta04@nagarro.com | ⬜ Pending |

---
**Next step:** execute SIT flows F1–F4 and UAT scenarios 1–6 in the app, record results here, then finalize. Deployment/Go-Live stays blocked until UAT sign-off is obtained and there are no open Critical/High defects.
