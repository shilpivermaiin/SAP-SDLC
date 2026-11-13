# Test Document

> **Status: In Progress.** Not frozen. SIT and UAT were executed on 2026-11-13 through the deployed app; 6 defects are open (1 High), see Section 9.

## PS-APP-001 — Project & RFP Effort Management

### 1. Document Control
| Field | Value |
|---|---|
| Object ID | PS-APP-001 |
| Object Name | Project & RFP Effort Management (Fiori App) |
| Linked Build & Unit Test Record Ref | [Build_PS-APP-001.md](Build_PS-APP-001.md) (v1.5) |
| Linked Technical Spec Ref | [TechnicalSpec_PS-APP-001.md](TechnicalSpec_PS-APP-001.md) (v1.2) |
| Linked Functional Spec Ref | [FunctionalSpec_PS-APP-001.md](FunctionalSpec_PS-APP-001.md) (v1.2) |
| Tester(s) | ankur.gupta04@nagarro.com (Technical Consultant / Developer; also acting as Business Owner for UAT). Execution: AI session through the Fiori deploy connector (headless Chromium on the connector host, SAP user ASHUTOSH) |
| Test system | PS4, client 110 (DEV). No separate QA/UAT client was used, by the user's decision. Transport PS4K902111 is released; its import into QA has not been confirmed. |
| App URL | https://sapdev.nagarro.com:44300/sap/bc/ui5_ui5/sap/zps_rfpeffort/index.html?sap-client=110 |
| Version | 0.2 |

#### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 0.1 | 2026-11-13 | ankur.gupta04@nagarro.com | Initial creation. Component tests re-run in DEV; SIT and UAT scripts prepared but not executed (the browser UI cannot be driven from the AI session). | In Progress |
| 0.2 | 2026-11-13 | ankur.gupta04@nagarro.com | SIT flows F1–F4 and UAT scenarios 1–6 executed against the deployed app in PS4 / 110, using the Fiori deploy connector's headless browser (`browser_run`) and OData client (`odata_request`), signed in as SAP user ASHUTOSH. 6 defects logged. | In Progress |

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
| User interfaces (push buttons, line selection) | List, create, add line, Mark as Won, dashboard, rate master | ✅ Executed on the deployed app (Section 3); defects D-01, D-02, D-06 |
| Output layouts (incl. paper printouts) | No printing in scope; dashboard spreadsheet export | ⚠️ Export dialog ran to completion; the downloaded file's content was not inspected (the tool cannot open downloads) |
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
| App flow F1: List → Create RFP → Detail → add estimate line (cost auto-calculated) | ✅ Passed: RFP "UAT Test RFP Alpha" created, owner defaulted, status Estimate; line SD / Prepare / Consultant / 10 h → 1,000 USD | D-05, D-06 (cosmetic/performance) |
| App flow F2: Detail → Mark as Won → Actuals tab appears → add actual line | ✅ Passed: confirmation dialog, status Won, button hidden, Actuals tab shown; actual line 12 h → 1,200 USD saved | D-02 |
| App flow F3: Dashboard matrix and RFP summary, export to spreadsheet | ✅ Matrix and summary show correct totals and variance; ⚠️ export file content not verified | — |
| App flow F4: Rate Master → add, change, delete a rate; value help in the line dialog shows the role | ✅ Add and inline change passed (SD / Consultant / 100 USD); role value help used in the line dialog. Delete not executed (rate kept as test data) | D-03 |

### 4. String/Cycle Testing
N/A. The object is not part of a multi-module business process cycle; the app flows F1–F4 in Section 3 cover its own end-to-end path.

### 5. User Acceptance Testing (UAT)
Business Owner for UAT: ankur.gupta04@nagarro.com (by the user's decision). Test data: invented sample data only ("UAT Test RFP Alpha", "Test Customer A", rate SD / Consultant 100 USD); no production data. Executed by the AI session on the user's instruction; the Business Owner still has to accept the results.

| FS Scenario Ref (Section 11) | Executed By | Result |
|---|---|---|
| 1. Create an RFP and add estimate lines with a matching rate (e.g. rate SD / Consultant = 100 USD, line SD / Prepare / 10 h) → expect cost 1,000 USD, status Estimate | AI session (UI) | ✅ Passed: cost 1,000 USD, status Estimate |
| 2. Mark an RFP as Won → expect status Won, Actuals tab available | AI session (UI) | ✅ Passed; ❌ estimate lines stay editable after Won (D-02) |
| 3. Log actuals with an activity description on a Won RFP → expect save, and the dashboard shows estimate vs. actual | AI session (UI) | ✅ Passed: saved 12 h / 1,200 USD; dashboard shows estimate vs. actual and variance |
| 4. Enter negative effort → expect save blocked with an on-screen error | AI session (UI) | ✅ Passed: "Effort must be zero or positive" shown, nothing saved |
| 5. Log actuals on an RFP still in Estimate → expect save blocked, message says it must be marked Won first | AI session (UI + OData) | ✅ Passed: Actuals tab hidden in the UI; direct POST rejected with ZPS_EFFORT/005 "Project must be marked \"Won\" before logging actuals" |
| 6. Line with no matching rate → expect cost blank, non-blocking note, manual cost accepted | AI session (UI + OData) | ⚠️ Partial: save not blocked and manual cost 800 USD accepted (override flag set); ❌ note not shown in UI (D-01); cost shows 0 instead of blank (D-04) |

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
| D-01 | The no-rate warning ZPS_EFFORT/004 is returned by the backend (`sap-messages` header) but the UI shows only "Saved"; FS §8 error 4 requires an on-screen note | Medium | Open | UI must surface warning messages after create (e.g. message toast or popover) |
| D-02 | Estimate lines stay editable and deletable after the RFP is Won, both in the UI and through the API (PATCH accepted, cost recalculated); FS §6 Rule 7 says estimate lines remain visible as read-only reference | High | Open | Needs feature control on estimate items when header status is WON (backend) and read-only estimate table in the UI. Test data was restored to 10 h after the check |
| D-03 | Add-rate dialog saves a blank Rate as 0 although the field is marked required | Low | Open | Validate in the dialog or reject 0/blank in the rate validation, subject to FS confirmation that a 0 rate is invalid |
| D-04 | With no matching rate the cost shows 0 instead of blank (FS §6 Rule 4) | Low | Open | Known build assumption (Build record §11: blank cannot be told apart from 0 in a decimal field); needs FS decision or a nullable/empty display in the UI |
| D-05 | App deployed without `Component-preload.js` (404, modules load one by one) | Low | Open | Run `ui5 build` before deployment and redeploy |
| D-06 | UI5 "templateShareable" FUTURE FATAL warnings for the Select controls in the estimate/actual tables | Low | Open | Set `templateShareable: true` on the inner item bindings |

### 10. Assumptions & Dependencies
- Assumed (user decision): DEV client 110 serves as the test client; no separate QA/UAT client.
- Assumed (user decision): the developer also acts as Business Owner for UAT sign-off.
- SIT and UAT were executed through the Fiori deploy connector's browser and OData tools (headless Chromium on the connector host, SAP user ASHUTOSH), not on a person's device.
- Test data left in DEV: RFP "UAT Test RFP Alpha" (Won, 2 estimate lines, 1 actual line) and rate SD / Consultant 100 USD.
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
| Tester/Programmer | ankur.gupta04@nagarro.com | ⬜ Pending (open defects) |
| Peer Reviewer / Technical Designer | Not yet assigned | ⬜ Pending |
| Development Lead | Not yet assigned | ⬜ Pending |
| Business Owner (UAT) | ankur.gupta04@nagarro.com | ⬜ Pending |

---
**Next step:** fix D-01 and D-02 (and the Low items as agreed), retest, obtain UAT sign-off, then finalize. Deployment/Go-Live stays blocked while D-02 (High) is open and UAT sign-off is pending.
