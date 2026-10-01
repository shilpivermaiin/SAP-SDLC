# Build & Unit Test Record

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | MM-RPT-001 |
| Object Name | Recently Created Purchase Orders View (package `ZMM_RECENTPO`) |
| Linked Technical Spec Ref | [TechnicalSpec_MM-RPT-001.md](TechnicalSpec_MM-RPT-001.md) |
| Linked Functional Spec Ref | [FunctionalSpec_MM-RPT-001.md](FunctionalSpec_MM-RPT-001.md) (v1.1) |
| Developer | SHILPI (SAP connection user) |
| Version | 1.0 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-10-01 | SHILPI | Initial creation | Frozen |

## 2. Development Environment & Transport
| Item | Value |
|---|---|
| System / DEV Client | PS4, client 110 (ABAP release 816, S/4HANA On-Premise) |
| Package | `ZMM_RECENTPO` (software component HOME, transport layer ZPS4) |
| Workbench Request (single) | `PS4K902109` (task `PS4K902110`), "MM-RPT-001 Recent POs view (Fiori list app)" |
| Customizing Request (single, if applicable) | Not created. The connector creates Workbench requests only. Needed only if the launchpad/role objects are transported (manual item M-4). |

## 3. Objects Built
| Object Type | Object Name | Status | Deviation from TS? |
|---|---|---|---|
| Package | `ZMM_RECENTPO` | Active | No |
| CDS view entity | `Z_I_RECENTPONETAMOUNT` | Active | No |
| CDS view entity | `Z_I_RECENTPURCHASEORDER` | Active | No |
| CDS view entity | `Z_C_RECENTPURCHASEORDER` | Active | No |
| Metadata extension | `Z_C_RECENTPURCHASEORDER_MDE` | Active | No |
| Access control | `Z_C_RECENTPURCHASEORDER` | Active (inherits the standard PO access control) | No |
| Service definition | `Z_UI_RECENTPURCHASEORDER` | Active | No |
| Service binding (OData V4 UI) | `ZRECENTPURCHASEORDER_O4` | Active, **not published** (manual item M-1) | No |
| Test class | `ZCL_MM_RECENTPO_TEST` | Active | Yes: three local test classes (`LTC_RECENTPO`, `LTC_RECENTPO_NET`, `LTC_RECENTPO_IF`) instead of one, because the CDS test framework allows one test environment per test class. Test cases are as designed. |
| Fiori Elements list report app | `zmm.recentpo` | Source built and validated locally in `apps/zmm.recentpo/`. **Not deployed** (manual item M-3). | No |
| Launchpad tile / catalog / role | `Z_MM_RECENTPO_TILE` / `Z_MM_RECENTPO_CAT` / `Z_MM_RECENTPO` | **Not created** (manual items M-4, M-5). The launchpad customisation service is not active on PS4. | No |

Auto-added to the transport by SAP: Gateway V4 service group assignment and service authorisation default for the binding.

## 4. Coding Standards & Security Compliance
| Check | Status | Notes |
|---|---|---|
| Naming conventions & modularization | ✅ | Names from `config/naming-standards.json`. Two patterns (access control, launchpad catalog) were added to that file in `/TechnicalSpec`. |
| Performance best practices (no nested SELECTs, proper JOINs, no `SELECT *`) | ✅ | No custom ABAP in production code. Compiled SQL of the consumption view applies the 30-day window and client filter at the database. The net-total view aggregates only items of POs in the same window. |
| Authorization checks & input validation | ✅ | Access control inherits the standard PO access control (document type, purchasing organisation, purchasing group, display). No user input exists. Observed on PS4: a user without the standard authorisation gets zero rows. |
| No hardcoded credentials; dynamic SQL handled safely | ✅ | No dynamic SQL. The deploy configuration reads the SAP host and credentials from a local `.env` (git-ignored). |
| Inline documentation/comments per team standard | ✅ | Each view carries a comment naming the FS rules it implements. |

## 5. Unit Test Results
| # | Test Case (from TS Section 12) | Method/Class | Result | Evidence |
|---|---|---|---|---|
| 1 | PO created today appears | `LTC_RECENTPO` / `TODAY_INCLUDED` | ✅ Passed | ABAP Unit run, 7 of 7 passed |
| 2 | PO created exactly 30 days ago appears | `LTC_RECENTPO` / `DAY30_INCLUDED` | ✅ Passed | same run |
| 3 | PO created 31 days ago is excluded | `LTC_RECENTPO` / `DAY31_EXCLUDED` | ✅ Passed | same run |
| 4 | Total net value sums items of a PO | `LTC_RECENTPO_NET` / `NET_TOTAL_SUMS_ITEMS` | ✅ Passed | same run (two items: 10.00 + 15.50 = 25.50 INR) |
| 5 | PO with no items listed with total 0 | `LTC_RECENTPO_IF` / `NO_ITEMS_TOTAL_ZERO` | ✅ Passed | same run |
| 6 | Release values R and B map to status text; no value shows blank | `LTC_RECENTPO` / `RELEASE_STATUS_TEXT` | ✅ Passed | same run |
| 7 | PO flagged for deletion is still listed | `LTC_RECENTPO` / `DELETED_STILL_LISTED` | ✅ Passed | same run |

The system date is fixed to 2026-10-01 through the CDS test framework so the window tests are deterministic.

## 6. Self-Test Against FS Scenarios
| FS Scenario Ref (Section 11) | Result |
|---|---|
| 1. PO created 5 days ago appears with all eight columns | ⚠️ Partly verified. Data layer verified on PS4: the interface view returns every PO in the window (26) with number, date, created by, supplier number and name, company code, purchasing organisation, net total and currency. The visible app and the status column on real data need the deployed app. Real PS4 candidates: POs `4500000647` and `4500000648` (created 2026-09-26). |
| 2. PO created exactly 30 days ago appears | ✅ Unit test (day 30) passed. PS4 PO `4500000624` (created 2026-09-01) is exactly on the boundary. |
| 3. Buyer with some purchasing organisations sees only those POs | ❌ Not yet testable: needs a test user with partial authorisation (manual item M-2). |
| 4. PO created 31 days ago does not appear | ✅ Unit test (day 31) passed. |
| 5. User with no PO authorisation sees no rows | ✅ Observed on PS4: user `SHILPI` has no standard PO display authorisation and gets zero rows from the standard view and from the consumption view. The standard no-authorisation message in the app needs the deployed app. |
| 6. Empty window shows the empty-list text | ⚠️ App text set in the app's i18n file; visible behaviour needs the deployed app and an empty window. |

## 7. Code Review
| Reviewer | Findings | Resolution | Status |
|---|---|---|---|
| Developer (own review pass) | (1) Consumption view exposes purchasing group and PO type only so the inherited access control can evaluate them. They are hidden in the UI. (2) Empty-list text relies on the Fiori Elements standard text keys being overridable. (3) Access-control inheritance verified by activation, but not yet with a fully authorised user. | (1) Intentional, documented in the view. (2) and (3) carried to `/Testing`. | Own review passed, no open findings |
| Peer reviewer | Pending | n/a | ⬜ Pending |

## 8. Static Code Analysis
| Tool | Result | Exceptions Documented |
|---|---|---|
| Code Inspector / ATC (default variant) | Test class: 0 findings after fixing two (ABAP Doc comment position, `SELECT` without `WHERE` in a test). | CDS objects (views, annotations, access control, service definition and binding): SAP returned "no processed objects" for each over this connection, so no ATC result exists for them. CDS syntax and activation checks passed. A package-level ATC CI run was also incomplete for the same reason. To be re-run from Eclipse/GUI by the peer reviewer. |

## 9. Component Test Plan (Finalized)
> Updated from TS Section 12a with real PS4 data points. Test data is provided by the Procurement lead.

| # | Acceptance Test Criteria | Test Data / Selection Parameters | Expected Result | Actual Result |
|---|---|---|---|---|
| 1 | FS scenario 1: PO created 5 days ago appears with all eight columns filled | PS4 POs `4500000647` / `4500000648` (created 2026-09-26) | PO appears, all columns filled | Pending (needs deployed app) |
| 2 | FS scenario 2: PO created exactly 30 days ago appears | PS4 PO `4500000624` (created 2026-09-01; today 2026-10-01) | PO appears | Pending (unit test passed) |
| 3 | FS scenario 3: buyer with some purchasing organisations sees only those POs | Test user authorised for one of NG01 / 1710 / TTPO only; PS4 has POs in all three | Only authorised POs listed | Pending (needs partial-authorisation user) |
| 4 | FS scenario 4: PO created 31 days ago does not appear | A PO created 2026-08-31 (Procurement lead to provide) | PO does not appear | Pending (unit test passed) |
| 5 | FS scenario 5: user with no PO authorisation sees no rows | User without standard PO display authorisation | No rows; standard no-authorisation message | Zero rows observed for `SHILPI`; message pending |
| 6 | FS scenario 6: empty window shows the empty-list text | A context where no PO falls in the window | "No purchase orders were created in the last 30 days" | Pending |
| 7 | List sorted newest first | Several POs with different creation dates | Descending by creation date | Pending (needs deployed app) |
| 8 | Response time at the available volume | PS4 data: 26 POs in the window | Opens within normal interactive response | Pending |
| 9 | Net total correctness on real data | PS4 PO `4500000624` (12,000.00 INR) and PO `4500000625` (5.25 USD) | Totals match the item sums | Data layer ✅: totals as listed returned by the interface view |
| 10 | Aged / end-of-purpose-blocked POs and deleted-item totals (FS follow-ups 1 and 2) | Any such POs, if they exist | Observed behaviour reported back to the FS owner | Pending |

## 10. Transport Finalization
| Transport Request | Type (Workbench/Customizing) | Contents | Released Date | Ready for QA? |
|---|---|---|---|---|
| `PS4K902109` | Workbench | Package, 3 CDS views, metadata extension, access control, service definition, service binding, Gateway service group, service authorisation default, test class (11 objects) | Not released | No. The Fiori app (and, if needed, a Customizing request for launchpad/role objects) must be added first, so the single-request rule is kept. |

## 11. Assumptions & Dependencies
- ⚠️ The PS4 data points above assume today is 2026-10-01 (system date).
- Dependencies: Basis (service publish, launchpad content, app deploy), Security (roles and test users), Procurement lead (test data).
- FS follow-ups carried from `/TechnicalSpec` stay open: aged / end-of-purpose-blocked POs are excluded by the standard view, and deleted items count toward the total.

## 12. Issues Log
> Includes any spec changes raised during coding, per the Issue & Change Escalation process.

| Issue ID | Description | Resolution | Schedule Impact | Budget Impact | Status |
|---|---|---|---|---|---|
| I-1 | Package creation rejected: needs a valid SAP user as person responsible | Used the owner of the new transport request (`SHILPI`) | None identified | None identified | Closed |
| I-2 | Interface view failed to activate: `@Semantics.currencyCode` not allowed in view entities | Removed it; currency is carried by the amount annotation | None identified | None identified | Closed |
| I-3 | Access control failed to activate: inheritance syntax missing the parent entity | Corrected to name the parent entity | None identified | None identified | Closed |
| I-4 | Unit tests: only one CDS test environment is allowed per test class | Split into three local test classes (deviation recorded in Section 3) | None identified | None identified | Closed |
| I-5 | Unit tests: date arithmetic passed directly to a method; wrong session variable name for the system date | Computed into a variable; used the framework's date constant | None identified | None identified | Closed |
| I-6 | ATC: two test-class findings | Fixed both; 0 findings | None identified | None identified | Closed |
| M-1 | Service binding cannot be published in client 110 (customizing client) | Manual: publish from a non-customizing client or via Gateway V4 admin | None identified | None identified | Open |
| M-2 | Development user has no standard PO display authorisation (zero rows from standard and custom views) | Manual: Security to grant `M_BEST_BSA`, `M_BEST_EKO`, `M_BEST_EKG` (activity 03), and a partially authorised test user | None identified | None identified | Open |
| M-3 | Fiori app not deployed: no SAP host or credentials in this environment | Manual: set `SAP_URL`, `SAP_USER`, `SAP_PASSWORD` in a local `.env`, run `npm run deploy` in `apps/zmm.recentpo`; deploys under the same transport request | None identified | None identified | Open |
| M-4 | Launchpad customisation service not active on PS4 | Manual: create catalog `Z_MM_RECENTPO_CAT` and tile `Z_MM_RECENTPO_TILE`; create one Customizing request if needed | None identified | None identified | Open |
| M-5 | Role `Z_MM_RECENTPO` not created | Manual: Security creates the role with the catalog and service authorisation | None identified | None identified | Open |

## 13. Sign-off
| Role | Name | Status |
|---|---|---|
| Developer | SHILPI | ✅ Approved |
| Peer Reviewer | | ⬜ Pending |
| Technical Lead | | ⬜ Pending |

---
**Next step:** `/Testing` for Object ID: MM-RPT-001, using this Build & Unit Test Record and the linked TS/FS as reference.
