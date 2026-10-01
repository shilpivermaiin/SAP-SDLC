# Build & Unit Test Record

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | PS-APP-001 |
| Object Name | Project & RFP Effort Management (Fiori App) |
| Linked Technical Spec Ref | TechnicalSpec_PS-APP-001.md (v1.2) |
| Linked Functional Spec Ref | FunctionalSpec_PS-APP-001.md |
| Developer | ankur.gupta04@nagarro.com (SAP user ANKUR) |
| Version | 1.1 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-10-01 | ankur.gupta04@nagarro.com | Initial creation. Backend built and unit-tested in DEV; UI5 app built locally; deployment, service publishing and authorization setup still open (see Sections 10–12). | In Progress |
| 1.1 | 2026-10-01 | ankur.gupta04@nagarro.com | Custom authorization object `ZPS_EFRT` and all code-level authorization checks removed at the user's instruction (not required); TS now v1.2, FS §9 now v1.1. "Mark as Won" is now tested end to end. | In Progress |

## 2. Development Environment & Transport
| Item | Value |
|---|---|
| System / DEV Client | PS4, client 110 (on-premise, SAP_BASIS release 816) |
| Package | ZPS_EFFORT (software component HOME, transport layer ZPS4, target PS4.100) |
| Workbench Request (single) | PS4K902111, "PS-APP-001 Project & RFP Effort Management" (open, not released) |
| Customizing Request (single, if applicable) | None; no customizing is involved (FS §10) |
| Connection | SAP ADT connector (SAP-PS4-110). The local abaplint pre-write check cannot parse RAP behavior pools, so it was skipped for those writes; SAP's own syntax check and activation were the gate. |

## 3. Objects Built
| Object Type | Object Name | Status | Deviation from TS? |
|---|---|---|---|
| Package | ZPS_EFFORT | Active | No |
| Message class | ZPS_EFFORT | Active (messages 001–006) | Message 006 added |
| Table | ZPS_EFFRT_HDR, ZPS_EFFRT_ITM, ZPS_EFFRT_RATE | Active | `CURRENCY` added to the item table |
| CDS (interface) | Z_I_PSEFFRTHDR, Z_I_PSEFFRTITM, Z_I_PSEFFRTRATE | Active | No |
| CDS (consumption/analytical) | Z_C_PSEFFRTHDR, Z_C_PSEFFRTITM, Z_C_PSEFFRTDASH | Active | No |
| CDS (value help) | Z_I_PSEFFRTROLEVH | Active | Added (not in the v1.0 TS list) |
| Behavior definition | Z_I_PSEFFRTHDR (header + item), Z_C_PSEFFRTHDR (projection), Z_I_PSEFFRTRATE | Active | Renamed/structured per RAP rules |
| Class | ZBP_I_PSEFFRTHDR, ZBP_I_PSEFFRTRATE (behavior pools with unit tests), ZCX_PS_EFFORT | Active | Pool names follow the renamed behavior definitions |
| Service definition | Z_UI_PSEFFRTHDR, Z_UI_PSEFFRTRATE | Active | No |
| Service binding (OData V4) | ZPSEFFRTHDR_O4, ZPSEFFRTRATE_O4 | Active, **not published** | Publishing is not allowed in this customizing client |
| SAPUI5 app | zps.rfpeffortmgmt | Built locally under `build/PS-APP-001/ui5app/`; **not deployed** | Deploy container `ZPS_RFPEFFORT` added |
| PFCG roles (service access only) | Z_PS_EFFORT_PRESALES / _DELIVERY / _PM / _TEAM | **Not created** | Manual (PFCG); the custom authorization object was removed from scope |
| Launchpad tile | Z_PS_RFPEFFORT_TILE | **Not created** | Depends on the deployed app |

Deviations are recorded in TS v1.1 and v1.2.

## 4. Coding Standards & Security Compliance
| Check | Status | Notes |
|---|---|---|
| Naming conventions & modularization | ✅ | `Z` names per `config/naming-standards.json`; rule logic is in small local classes separate from the RAP handlers |
| Performance best practices (no nested SELECTs, proper JOINs, no `SELECT *`) | ✅ | The only SELECTs are two `FOR ALL ENTRIES` reads with an empty-table guard; dashboard aggregation (`SUM`/`GROUP BY`) is pushed down in `Z_C_PSEFFRTDASH` |
| Authorization checks & input validation | ✅ | No custom authorization object or code-level check, by decision (FS §9 v1.1): access is controlled by role assignment to the services. Server-side validation of module, phase, entry type, signs and mandatory fields is in place. |
| No hardcoded credentials; dynamic SQL handled safely | ✅ | No credentials; no dynamic SQL; `ui5-deploy.yaml` carries a placeholder URL and reads credentials from an untracked `.env` |
| Inline documentation/comments per team standard | ✅ | Comments only where behavior is non-obvious |

## 5. Unit Test Results
| # | Test Case (from TS Section 12) | Method/Class | Result | Evidence |
|---|---|---|---|---|
| 1 | Negative effort is rejected | `test_effort_negative_blocked`, `test_bo_negative_effort` | ✅ Passed | SAPDiagnose unittest, ZBP_I_PSEFFRTHDR: 18/18 |
| 2 | Negative cost is rejected | `test_cost_negative_blocked` | ✅ Passed | same run |
| 3 | Cost auto-calculates with a matching rate | `test_cost_autocalc_with_rate`, `test_bo_item_autocalc` | ✅ Passed | same run |
| 4 | Cost stays blank with no rate | `test_cost_blank_when_no_rate`, `test_bo_item_no_rate` | ✅ Passed | same run |
| 5 | Actual blocked when header is not Won | `test_actuals_blocked_not_won`, `test_bo_actual_needs_won` | ✅ Passed | same run |
| 6 | "Mark as Won" transition | `test_bo_mark_as_won`, `test_bo_actual_after_won` | ✅ Passed (real action run against doubled tables) | same run |
| 7 | Mandatory-field validation | `test_mandatory_validation`, `test_invalid_value_validation` | ✅ Passed | same run |
| + | Manual override kept, stale cost cleared, missing-currency guard, header defaults, actuals allowed when Won, actual saved after Won | `test_manual_cost_override_kept`, `test_stale_cost_cleared`, `test_rate_without_currency`, `test_bo_header_defaults`, `test_actuals_allowed_when_won` | ✅ Passed | same run |
| + | Rate Master validation (4 tests) | `ltc_rate_check` in ZBP_I_PSEFFRTRATE | ✅ Passed | SAPDiagnose unittest: 4/4 |

Total: 22 of 22 passed (header/item pool 18, rate pool 4). Approach: rule logic sits in pure helper classes tested directly; 7 further tests run the real RAP handlers (defaults, determination, the "Mark as Won" action, save validations) against doubled database tables. The TS called for EML test doubles.

## 6. Self-Test Against FS Scenarios
| FS Scenario Ref (Section 11) | Result |
|---|---|
| 1. Create RFP, add estimate lines with a matching rate | ✅ Header defaults to Estimate and cost auto-calculates (BO-level test). The dashboard views run against the database (empty). |
| 2. Mark an RFP as Won | ✅ Action run through the real handler: status becomes Won (BO-level test) |
| 3. Log actuals with an activity description on a Won RFP | ✅ Saved after the RFP is marked Won (BO-level test) |
| 4. Negative effort | ✅ Blocked on save (BO-level test) |
| 5. Actuals while the RFP is still Estimate | ✅ Blocked on save (BO-level test) |
| 6. No matching rate | ✅ Cost stays blank, warning reported, manual entry kept (unit and BO-level tests) |

## 7. Code Review
| Reviewer | Findings | Resolution | Status |
|---|---|---|---|
| Developer self-review (pre-activation proofreading) | Behavior-definition etag clause not allowed on the item entity; `create` needed an explicit authorization opt-out under `strict(2)`; `AUTHORITY-CHECK` needs a character field; `failed` is not available in determinations; redundant conversions; over-long test method names; message class created empty | All fixed and re-activated | Closed |
| Peer reviewer | Not yet assigned | — | ⬜ Pending |

## 8. Static Code Analysis
| Tool | Result | Exceptions Documented |
|---|---|---|
| Code Inspector / ATC (default variant) | Classes and header behavior definition re-run after the authorization removal: 25 findings, all priority 3 (22 "strings without text elements" for field labels used as message parameters, 3 "SY-SUBRC after COMMIT ENTITIES" in test code). None at priority 1 or 2. Tables and behavior definitions: 0 findings. | Priority-3 findings accepted: labels are message parameters, not user-facing literals. |
| Coverage gap | ATC did not report the 7 CDS views, 2 service definitions and 2 service bindings (11 of 20 objects); the backend returned no worklist for them | Not a pass: these were verified by activation and by running the CDS views against the database instead |

## 9. Component Test Plan (Finalized)
| # | Acceptance Test Criteria | Test Data / Selection Parameters | Expected Result | Actual Result |
|---|---|---|---|---|
| 1 | Create an RFP and add estimate lines with a matching rate | Rate SD / Consultant = 100 USD; line SD, Prepare, 10 h | Cost 1,000 USD; status Estimate | ✅ BO-level test; UI step pending deployment |
| 2 | Mark an RFP as Won | Estimate-status RFP | Status Won; Actuals tab available | ✅ BO-level test; UI step pending deployment |
| 3 | Log actuals with an activity description on a Won RFP | Won RFP | Saved; dashboard shows estimate vs. actual | ✅ BO-level test (save); dashboard view pending deployment |
| 4 | Negative effort | any RFP | Save blocked | ✅ BO-level test |
| 5 | Actuals while status is Estimate | Estimate RFP | Save blocked | ✅ BO-level test |
| 6 | No matching rate | role with no rate | Cost blank, manual entry accepted | ✅ BO-level test (blank + warning); manual entry covered by the cost-logic unit test |
| 7 (new) | Manual cost override survives when a rate exists | line with a manual cost differing from hours × rate | Cost kept, override flag set | ✅ Unit test |
| 8 (new) | Dashboard export | Dashboard with data | Spreadsheet downloads with the on-screen columns | ⏳ Needs deployed app |

## 10. Transport Finalization
| Transport Request | Type (Workbench/Customizing) | Contents | Released Date | Ready for QA? |
|---|---|---|---|---|
| PS4K902111 | Workbench | 22 repository objects (package, message class, 3 tables, 7 CDS views, 3 behavior definitions, 3 classes, 2 service definitions, 2 service bindings) plus the generated gateway service-group entries (G4BA, SUSH) | Not released | ❌ Not yet: the BSP application still has to be added to the same request, so releasing now would break the single-request rule |

## 11. Assumptions & Dependencies
- Single currency across the app; item currency is copied from the matched rate, and a manual cost with no rate keeps a blank currency.
- Effort of 0 is valid, so "mandatory" is enforced as "not negative"; a blank cannot be told apart from 0.
- Cost arithmetic assumes 2-decimal currencies.
- The Role list is the set of roles that exist in the Cost Rate Master.
- **Manual dependencies outstanding** (cannot be done through the connected tooling):
  - Create the four `Z_PS_EFFORT_*` roles in PFCG and assign them the service start access: all four get `Z_UI_PSEFFRTHDR`; only the roles that maintain rates (by default `Z_PS_EFFORT_DELIVERY`) get `Z_UI_PSEFFRTRATE`. No custom authorization object is needed.
  - Publish `ZPSEFFRTHDR_O4` and `ZPSEFFRTRATE_O4` from a client where publishing is allowed (client 110 refuses it).
  - Provide the SAP system URL and credentials (or deploy through ADT) so `npm run deploy` can create `ZPS_RFPEFFORT` under PS4K902111.
  - Create the Launchpad catalog/tile and target mapping once the app is deployed.

## 12. Issues Log
| Issue ID | Description | Resolution | Schedule Impact | Budget Impact | Status |
|---|---|---|---|---|---|
| I-01 | Live system already holds a Pre-Sales tracker (RFP/opportunity master with WIN/LOSS status) and a Genus Cost table overlapping the TS's new header and rate master; earlier reuse answers were given without system access | User decided: build exactly as frozen | None | None | Closed |
| I-02 | `/NGR/` namespace names exceeded system limits (tables 16 chars, auth objects 10 chars); user then switched to the `Z` namespace | TS updated to v1.1 | None | None | Closed |
| I-03 | RAP rules: a behavior definition carries its root view's name and the item child lives inside the header definition | Renamed in TS v1.1 | None | None | Closed |
| I-04 | Objects the TS inventory omitted but the build needs: role value-help view, message 006, item `CURRENCY`, BSP deploy container | Added; TS v1.1; naming gap logged in `config/naming-standards.json` | None | None | Closed |
| I-05 | FS contradicts itself on a missing rate: Rule 4 says "no warning", §8 lists a non-blocking warning | Implemented the non-blocking warning (message 004) | None | None | ⚠️ Needs FS clarification |
| I-06 | FS §5 makes Activity Description mandatory for actual lines but TS rule 6 does not list it | Implemented per FS §5 | None | None | Closed |
| I-07 | Service bindings cannot be published in the customizing client | Manual publish where allowed (Section 11) | Possible | None | Open |
| I-08 | Custom authorization object `ZPS_EFRT` could not be created through the tooling | Removed from scope at the user's instruction (not required); code, TS v1.2 and FS §9 v1.1 updated. Roles are created manually in PFCG | None | None | Closed |
| I-09 | UI5 app built but not deployed or exercised against the live service | Needs SAP URL and credentials (Section 11) | Possible | None | Open |
| I-10 | Message class was created without messages by the batch call | Messages written by update and re-activated; verified by read-back | None | None | Closed |
| I-12 | `strict(2)` requires an authorization clause even without custom checks | Behavior definitions keep a bare `authorization master ( global )` / `dependent` declaration with empty handlers | None | None | Closed |
| I-11 | Local abaplint cannot parse RAP behavior pools | Local lint skipped for those writes; SAP syntax check and activation used | None | None | Closed |

## 13. Sign-off
| Role | Name | Status |
|---|---|---|
| Developer | ankur.gupta04@nagarro.com | ✅ Approved |
| Peer Reviewer | | ⬜ Pending |
| Technical Lead | | ⬜ Pending |

---
**Next step:** `/Testing` for Object ID: PS-APP-001, once the manual dependencies in Section 11 are cleared and PS4K902111 is ready for QA import.
