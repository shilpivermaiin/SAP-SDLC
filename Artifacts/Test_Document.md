# Test Document

> **Status: In Progress. Not frozen. Not a go-live gate pass.** UAT sign-off, the peer review and security testing are outstanding. Only items marked Passed were actually executed. Everything else is Pending or Blocked.

## MM-RPT-001 – Recently Created Purchase Orders View

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | MM-RPT-001 |
| Object Name | Recently Created Purchase Orders View (package `ZMM_RECENTPO`) |
| Linked Build & Unit Test Record Ref | [Build_MM-RPT-001.md](Build_MM-RPT-001.md) |
| Linked Technical Spec Ref | [TechnicalSpec_MM-RPT-001.md](TechnicalSpec_MM-RPT-001.md) |
| Linked Functional Spec Ref | [FunctionalSpec_MM-RPT-001.md](FunctionalSpec_MM-RPT-001.md) (v1.1) |
| Tester(s) | SHILPI (SAP connection user), executing data-level tests on PS4 client 110 |
| Version | 1.0 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-10-01 | SHILPI | Initial creation: data-level tests executed; app-level, review, UAT and security tests pending | In Progress |

## 2. Component Test

### 2a. Component Test Execution
> The build is declarative (CDS views, access control, service, Fiori Elements app) with no custom production ABAP, so the ABAP-statement key areas are not applicable and are recorded as such.

| Key Area | Test Condition | Result |
|---|---|---|
| Selection criteria validation | 30-day window, inclusive of day 30 and today, no later dates | ✅ Passed (unit tests today / day 30 / day 31; compiled SQL shows `creation date >= system date - 30 days` and `<= system date`) |
| Negative vs. positive values | Net totals including zero-value POs | ✅ Passed: POs `4500000627`, `4500000641`, `4500000646` show 0.00, matching the standard item sums |
| Select statements (`sy-subrc`) | No custom SELECT in production code | N/A: declarative |
| WHERE clauses (all components) | Interface view row count vs. standard header data for the same window | ✅ Passed: 26 POs in the standard header table = 26 in the interface view (PO category F, 2026-09-01 to 2026-10-01) |
| Read statements (`sy-subrc`) | No custom READ | N/A: declarative |
| Extract statements | None | N/A |
| Clear statements | None | N/A |
| Assignment statements | None | N/A |
| Table loops (endless loops/efficiency) | None | N/A. Aggregation is done in the database (net-total view) |
| PERFORMs/function modules | None | N/A |
| Calculation correctness (net total) | All 26 POs: view total vs. sum of standard item net values, including PO `4500000644` with two items (322,322.00 INR) | ✅ Passed: 26 of 26 match |
| Supplier name / currency / organisation fields | Spot data check on all 26 rows | ✅ Passed: supplier numbers and names, company codes, purchasing organisations and currencies populated and consistent |
| User interfaces (push buttons, line selection) | List opens, one screen, no actions, no selection | ⬜ Pending: app not deployed (manual item M-3) |
| Output layouts (incl. paper printouts) | Eight columns in FS order, sorted newest first, custom empty text | ⬜ Pending: app not deployed. Printouts N/A |
| Online documentation | Short note to buyers (FS 2a) | ⬜ Pending |

### 2b. Code & Component Test Review
| Reviewer | Review Item | Findings | Status |
|---|---|---|---|
| Developer (own pass) | Code and component test review | No open findings (see Build record Section 7) | Own review passed |
| Peer reviewer | Code and component test review | Not yet done: no reviewer named | ❌ Pending (core section) |

| Checklist | Status |
|---|---|
| Code Review Checklist (Appendix A) signed off | ⬜ Pending |
| Component Test Plan Review Checklist signed off | ⬜ Pending |

## 3. System Integration Testing (SIT)
| Process Flow / Integration Point | Result | Defect Ref (if any) |
|---|---|---|
| Launchpad tile → app → OData V4 service → views → standard PO data | ❌ Blocked: service not published (M-1), app not deployed (M-3), launchpad content not created (M-4/M-5) | none |
| Integration with other modules/interfaces | N/A: single system, no interfaces (SA write-up Section 6) | none |

## 4. String/Cycle Testing
| Business Process Cycle | Steps Executed | Result |
|---|---|---|
| Procure-to-pay | n/a | N/A: the app is a read-only list with no process step and no downstream object, so there is no cycle to run. Recorded here rather than skipped silently. |

## 5. User Acceptance Testing (UAT)
> UAT scenarios are FS Section 11. UAT environment: PS4 DEV client 110 with existing test data (no production data involved), per the user's answer.

| FS Scenario Ref (Section 11) | Executed By | Result |
|---|---|---|
| 1. PO created 5 days ago appears with all eight columns filled | Not yet executed by business users | ⬜ Pending (candidates: POs `4500000647`, `4500000648`, created 2026-09-26) |
| 2. PO created exactly 30 days ago appears | Not yet executed | ⬜ Pending (candidate: PO `4500000624`, created 2026-09-01). Unit test passed. |
| 3. Buyer authorised for some purchasing organisations sees only those | Not yet executed | ❌ Blocked: needs a partially authorised user (PS4 has POs in NG01, 1710 and TTPO) |
| 4. PO created 31 days ago does not appear | Not yet executed | ⬜ Pending. No PO exists for exactly 31 days ago (2026-08-31); PO `4500000623` (2026-08-27) is the nearest outside the window. Unit test passed. |
| 5. User with no PO authorisation sees no rows | Observed by tester as `SHILPI` | ⚠️ Partly observed: zero rows for `SHILPI` from both the standard and the custom view. Standard no-authorisation message in the app is pending. |
| 6. No POs in the window shows the empty-list text | Not yet executed | ⬜ Pending |

| Sign-off | Status |
|---|---|
| Business Owner (UAT): Procurement lead | ⬜ Pending |

## 6. Regression Testing
| Existing Functionality Tested | Method (Manual/Automated + Tool) | Result |
|---|---|---|
| Existing "Open Purchase Orders" app for another requirement (same ID MM-RPT-001, package `ZMM_OPENPO`): unit tests | Automated ABAP Unit (existing tests) | ✅ Passed: 11 of 11. Nothing in that package was changed. |
| Standard purchase-order views and tables | Compared standard header and item data with new views | ✅ Not changed: only read-only use of released views |
| Standard PO transactions | Automated tool requested by the user, but no tool or scripts named | ⬜ Pending |

## 7. Performance/Load Testing
| Scenario | Expected Load | Peak Load | Result |
|---|---|---|---|
| Interface view count for the 30-day window (26 POs, including item aggregation), run in ADT on PS4 | Modest (26 POs in window on PS4; production volume not provided) | Not provided | ✅ About 0.38 s, within normal interactive response. App-level timing (OData call from the app) is pending. |

## 8. Security Testing
| Role/Scenario | Test User | Result |
|---|---|---|
| User without standard PO display authorisation sees no rows | `SHILPI` | ✅ Observed: zero rows from the standard view and the custom view |
| Fully authorised user sees all POs of authorised purchasing organisations | Existing users (not named) | ❌ Not executed: the tester cannot act as another SAP user |
| Partially authorised user sees only authorised POs | Existing users (not named) | ❌ Not executed, as above |
| Service/app access for buyers (role, catalog, service authorisation) | n/a | ❌ Blocked: role and launchpad content not created |
| Verification that the inherited access control works for an authorised user | n/a | ❌ Not executed |

## 9. Defect Log
| Defect ID | Description | Severity | Status | Resolution |
|---|---|---|---|---|
| none | No defects found in the tests executed | n/a | n/a | n/a |

No Critical or High defects are open. Defects are not yet possible to find in the pending app-level, security and UAT tests.

## 10. Assumptions & Dependencies
- ⚠️ UAT is run in PS4 DEV client 110 with existing test data, as stated by the user.
- ⚠️ The security test users and the automated regression tool were not named. They are outstanding inputs.
- Open manual items from the Build record: M-1 (publish service), M-2 (test authorisations), M-3 (deploy app), M-4 (launchpad catalog/tile), M-5 (role).
- FS follow-ups 1 and 2 (aged / end-of-purpose-blocked POs excluded; deleted items counted in total): no effect on PS4 data: none of the 26 POs is aged, blocked, deleted, subject to release, or has deleted items.

## 11. Issues Log (spec changes raised during testing)
| Issue ID | Description | Resolution | Schedule Impact | Budget Impact | Status |
|---|---|---|---|---|---|
| T-1 | App-level, security, SIT and UAT tests cannot run until M-1 to M-5 are cleared | Retry when cleared | None identified | None identified | Open |
| T-2 | No peer reviewer or Business Owner named for review and UAT sign-off beyond "Procurement lead" for UAT | Name a peer reviewer | None identified | None identified | Open |
| T-3 | No spec change was needed so far | n/a | None identified | None identified | Closed |

## 12. Sign-off
| Role | Name | Status |
|---|---|---|
| Tester/Programmer | SHILPI | ✅ Approved (executed items only) |
| Peer Reviewer / Technical Designer | | ⬜ Pending |
| Development Lead | | ⬜ Pending |
| Business Owner (UAT) | Procurement lead | ⬜ Pending |

---
**Next step:** finish the pending tests, then freeze this document. Deployment/Go-Live for Object ID MM-RPT-001 stays blocked until UAT sign-off and no open Critical/High defects.
