# Technical Specification

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | PS-APP-001 |
| Object Name (Technical) | Project & RFP Effort Management (Fiori App) |
| RICEFW Type | Custom Object (Custom Tables + CDS Views + RAP Business Objects + OData V4 Services + Freestyle Fiori App) |
| Linked Functional Spec Ref | FunctionalSpec_PS-APP-001.md |
| Linked Solution Architect Ref | SolutionArchitect_ProjectRFPEffortManagement.md |
| Author | ankur.gupta04@nagarro.com |
| Version | 1.2 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-09-17 | ankur.gupta04@nagarro.com | Initial creation | Frozen |
| 1.1 | 2026-10-01 | ankur.gupta04@nagarro.com | Raised during `/Code`: (1) all technical object names changed from the `/NGR/` namespace to the `Z` namespace per user instruction; (2) RAP behavior definitions renamed to follow RAP rules (a behavior definition carries its root view's name and the item child entity is defined inside the header definition; projection definition added for the consumption views); (3) additions required to build: role value-help view, message 006, `CURRENCY` on the item table, UI5 deploy container. Business rules, screens and roles are unchanged. No `/Code` or `/Testing` output existed before this change. | Frozen |
| 1.2 | 2026-10-01 | ankur.gupta04@nagarro.com | Raised during `/Code` at the user's instruction: the custom authorization object `ZPS_EFRT` and all code-level authorization checks are removed (not required). "Mark as Won" and Cost Rate Master maintenance are controlled only by role assignment to the services (FS §9 v1.1). Message 007 removed; the `Z_PS_EFFORT_*` roles remain as the way to grant service access. The behavior definitions keep a bare `authorization master ( global )`/`dependent` declaration with empty handlers because `strict(2)` requires one. | Frozen |

## 2. Development Object Overview
- Object type: Custom Object set (3 custom tables, 6 CDS views, 3 RAP Business Objects, 2 OData V4 services, 1 freestyle SAPUI5 app) built on the S/4HANA ABAP stack per the Solution Architect write-up's RAP-based Clean Core approach.
- Naming: customer namespace `Z`, derived from `config/naming-standards.json`. (v1.0 used the `/NGR/` namespace at the user's instruction; v1.1 reverts to `Z` at the user's instruction during `/Code`. The `/NGR/` names exceeded system length limits for tables and authorization objects, which the `Z` names do not.)
- Package: `ZPS_EFFORT` (single development package for all objects in this requirement).
- Transport: single Workbench Request for PS-APP-001 (see Section 10a) — no Customizing Request needed, as no SPRO/customizing configuration is involved (per FS Section 10).

## 2a. Reuse Assessment (Revisited)
| Check | AI Finding | User Response | Status | Notes |
|---|---|---|---|---|
| Another FS/TS for 1SAP with predominantly the same functionality? (all WRICEF inventories considered) | No other FS/TS in `Artifacts/` matches this functionality (only MM-RPT-002 exists, unrelated and scrapped) | Confirmed — proceed as new build | ✅ Accepted | New, standalone build |
| WRICEF previously developed in another system? | No prior information available | No — genuinely new | ✅ Accepted | — |

## 2b. Clean Core Assessment (Mandatory)
| Check | AI Finding | User Response | Status | Notes |
|---|---|---|---|---|
| Prefer released APIs, RAP, CDS, ABAP Cloud over classic techniques? | Approach already uses RAP-managed Business Objects, CDS views, and an OData V4 service, per the Solution Architect write-up | Confirmed — fully Clean Core aligned | ✅ Accepted | Aligned with SA-fixed approach |
| Any direct modification of an SAP standard object? | None — fully custom, self-contained data model and logic | Confirmed | ✅ Accepted | No PS/CATS or other standard object touched |
| Any unreleased/non-strategic API used? | None — no external integration; only new custom OData V4 services are exposed | Confirmed | ✅ Accepted | No integration touchpoints, per SA write-up |

## 2c. Object Inventory & Impacted Components
| Object Name | Type | New or Impacted | Description |
|---|---|---|---|
| `ZPS_EFFRT_HDR` | Table | New | RFP/Project header: name, customer, owner, status |
| `ZPS_EFFRT_ITM` | Table | New | Estimate/Actual line items: module, phase, role, effort, cost, activity description |
| `ZPS_EFFRT_RATE` | Table | New | Cost Rate Master: rate per module + role |
| `Z_I_PSEFFRTHDR` | CDS View (Interface) | New | Interface view on header table |
| `Z_C_PSEFFRTHDR` | CDS View (Consumption) | New | RAP root projection view |
| `Z_I_PSEFFRTITM` | CDS View (Interface) | New | Interface view on line item table, associated to header |
| `Z_C_PSEFFRTITM` | CDS View (Consumption) | New | RAP child projection view |
| `Z_I_PSEFFRTRATE` | CDS View (Interface) | New | Interface view on Cost Rate Master |
| `Z_C_PSEFFRTDASH` | CDS View (Analytical) | New | Aggregated Module x Phase x Entry Type view (SUM effort/cost) for the dashboard |
| `Z_I_PSEFFRTHDR` | RAP Behavior Definition (root, managed; contains the item child entity `Z_I_PSEFFRTITM`) | New | Header CRUD, "Mark as Won" action, item CRUD, validations, cost determination |
| `Z_C_PSEFFRTHDR` | RAP Behavior Definition (projection) | New | Projection of the header/item behavior for the consumption views |
| `Z_I_PSEFFRTRATE` | RAP Behavior Definition (root, managed) | New | Cost Rate Master maintenance |
| `Z_I_PSEFFRTROLEVH` | CDS View (Value Help) | New | Distinct roles from the Cost Rate Master, used as the configurable role list (added in v1.1) |
| `ZPS_RFPEFFORT` | BSP Application (UI5 deploy container) | New | Repository container the SAPUI5 app is deployed into (added in v1.1; not covered by `config/naming-standards.json`, logged as a naming gap) |
| `ZBP_I_PSEFFRTHDR` | RAP Behavior Implementation Class | New | Validations/determinations/action for header + item |
| `ZBP_I_PSEFFRTRATE` | RAP Behavior Implementation Class | New | Rate Master maintenance logic |
| `Z_UI_PSEFFRTHDR` | Service Definition | New | Exposes header + item (+ dashboard) to the main app |
| `Z_UI_PSEFFRTRATE` | Service Definition | New | Exposes Cost Rate Master to the maintenance view |
| `ZPSEFFRTHDR_O4` | Service Binding (OData V4) | New | OData V4 binding for the main app |
| `ZPSEFFRTRATE_O4` | Service Binding (OData V4) | New | OData V4 binding for Rate Master maintenance |
| `zps.rfpeffortmgmt` | Freestyle SAPUI5 App | New | End-user application (all screens) |
| `Z_PS_RFPEFFORT_TILE` | Fiori Tile | New | Launchpad tile for the app |
| `ZPS_EFFORT` | Message Class | New | All application messages (Section 9) |
| `ZCX_PS_EFFORT` | Exception Class | New | Programmatic exceptions (e.g., rate lookup failure handling) |
| `Z_PS_EFFORT_PRESALES`, `_DELIVERY`, `_PM`, `_TEAM` | PFCG Roles | New | One role per user group defined in FS Section 9 / SA Prerequisites — no new roles introduced beyond those four |

## 3. Build Approach
- **Build approach selected:** RAP (RESTful ABAP Programming Model) managed Business Objects, CDS-based data model, exposed via OData V4 services; UI built as a freestyle SAPUI5 application (not Fiori Elements).
- **Justification:** This approach is fixed by the Solution Architect write-up (Section 4, "Finalized Solution Approach") — RAP-based on-stack Clean Core, freestyle SAPUI5 for full UI flexibility across the phase x module grids and dashboard. The Clean Core assessment (Section 2b) confirms it is fully aligned with SAP's preferred techniques: no standard-object modification, no unreleased API.
- All UI screens (List, Object Page-style detail, Dashboard, Rate Master maintenance) follow SAP's standard Fiori UX guidelines (SAP Fiori Design Guidelines, `sap.m`/`sap.ui.table` controls) despite being freestyle rather than templated, per the Solution Architect's UI decision.

## 4. Data Model
| Object | Type | Fields | Key Fields |
|---|---|---|---|
| `ZPS_EFFRT_HDR` | Table | EFFORT_ID (UUID), RFP_NAME, CUSTOMER_NAME, OWNER_USER, STATUS (Estimate/Won), CREATED_BY, CREATED_AT, CHANGED_BY, CHANGED_AT | CLIENT, EFFORT_ID |
| `ZPS_EFFRT_ITM` | Table | EFFORT_ID (FK), ITEM_ID (UUID), ENTRY_TYPE (Estimate/Actual), SAP_MODULE, ACTIVATE_PHASE, ROLE, EFFORT_HOURS, COST, CURRENCY (copied from the matched rate; added in v1.1 because an amount field needs a currency key), COST_MANUAL_OVERRIDE (flag), ACTIVITY_DESC, CREATED_BY, CREATED_AT, CHANGED_BY, CHANGED_AT | CLIENT, EFFORT_ID, ITEM_ID |
| `ZPS_EFFRT_RATE` | Table | SAP_MODULE, ROLE, RATE, CURRENCY, CREATED_BY, CREATED_AT, CHANGED_BY, CHANGED_AT | CLIENT, SAP_MODULE, ROLE |

Keys use RAP-standard UUID generation (no number range object required, consistent with FS's confirmation that no SPRO/customizing configuration is needed). RAP-managed Business Objects auto-generate their own lock objects from the Behavior Definition — no manually named lock object required.

## 4a. Program Definition(s)
> RAP-managed BOs don't use classic "programs" in the traditional sense; entries below describe the generated/managing artifacts per BO group.

| Field | Header + Item BO (`Z_I_PSEFFRTHDR` incl. child `Z_I_PSEFFRTITM`) | Rate Master BO (`Z_I_PSEFFRTRATE`) |
|---|---|---|
| Common or New Program? | New | New |
| Application | Cross-application custom (Presales/Project Effort Management) | Cross-application custom (Presales/Project Effort Management) |
| Development Class | `ZPS_EFFORT` | `ZPS_EFFORT` |
| Authorization Group | None — PFCG role-based access is sufficient (per confirmed answer) | None |
| Related SAP Transaction(s) | None — Fiori-only access, no classic transaction code | None |
| Program Description | RAP root (header) + child (item) BO: RFP/project CRUD, cost auto-calculation, status transition, all FS validations | Cost Rate Master CRUD (Module + Role + Rate) |
| Input/Output Files | None | None |
| Program Flow | See Section 5 (Program/Processing Logic Design) | See Section 5 |

## 5. Program / Processing Logic Design

**High-level flow:** User action in the SAPUI5 app → OData V4 request → RAP Business Object (validation → determination → save) → persisted to custom tables → CDS views (interface/consumption/analytical) read back for List, Detail, and Dashboard screens.

**FS Rule → Technical Implementation Mapping**
| FS Rule Ref | Business Rule (from FS) | Technical Implementation |
|---|---|---|
| FS §6, Rule 1 | Effort must be zero or positive | RAP Validation on `Z_I_PSEFFRTITM` (item entity): raises message `ZPS_EFFORT` 001 and blocks save if `EFFORT_HOURS < 0` |
| FS §6, Rule 2 | Cost must be zero or positive (manual entry/override) | RAP Validation on `Z_I_PSEFFRTITM`: raises message 002 and blocks save if `COST < 0` |
| FS §6, Rule 3 | Auto-calculate line cost from Cost Rate Master | RAP Determination on `Z_I_PSEFFRTITM` (trigger: on save/modify of Module, Role, or Effort): reads `Z_I_PSEFFRTRATE` by Module + Role, sets `COST = EFFORT_HOURS × RATE`, `COST_MANUAL_OVERRIDE = false` |
| FS §6, Rule 4 | No rate found — leave cost blank, allow manual entry | Same determination: if no matching Rate Master row, `COST` remains initial; no message raised (per FS, non-blocking, no warning) |
| FS §6, Rule 5 | Header mandatory fields required | RAP Validation on `Z_I_PSEFFRTHDR`: raises message 003 and blocks save if `RFP_NAME`, `CUSTOMER_NAME`, or `OWNER_USER` is initial |
| FS §6, Rule 6 | Line mandatory fields required | RAP Validation on `Z_I_PSEFFRTITM`: raises message 003 and blocks save if Module, Phase, Role, or Effort is initial |
| FS §6, Rule 7 | Status transition Estimate → Won | RAP Action `markAsWon` on `Z_I_PSEFFRTHDR`; sets `STATUS = 'WON'`; no authorization check (Section 10) |
| FS §6, Rule 8 | Actuals require "Won" status | RAP Validation on `Z_I_PSEFFRTITM`: if `ENTRY_TYPE = 'ACTUAL'` and associated header `STATUS ≠ 'WON'`, raises message 005 and blocks save |
| FS §6, Rule 9 | No approval gate | No release/approve action exists in the Behavior Definition by design — standard Create/Update operations persist directly; no additional implementation needed |

## 6. Reference Objects Used
None — per FS Section 6a, no standard SAP tables, BAPIs, IDocs, or transactions are referenced by this build; it is fully self-contained.

## 7. Interface / Integration Design
Not applicable — no external or other-SAP-system integration is required, per the Solution Architect write-up's confirmed constraints and the FS's Integration touchpoints assessment ("None").

## 8. UI / Output Technical Design
- **App:** `zps.rfpeffortmgmt`, a freestyle SAPUI5 application (per the Solution Architect's UI decision), consuming:
  - `ZPSEFFRTHDR_O4` (OData V4) — header + item entities (with `$expand`) for the List, Estimate Detail, and Actuals screens, plus the analytical `Z_C_PSEFFRTDASH` entity for the Dashboard.
  - `ZPSEFFRTRATE_O4` (OData V4) — Cost Rate Master entity for the admin maintenance view.
- **Screens (technical realization of FS Section 7):** custom List view (RFP/Project List), custom Object Page-style view with an Estimate tab and an Actuals tab (visible conditionally based on `STATUS`), custom Dashboard view (Module x Phase grid, with a toggle to an RFP-summary list view bound to the same analytical entity), and a Rate Master admin view (simple table/list bound to `ZPSEFFRTRATE_O4`).
- **Export:** client-side spreadsheet export using the `sap.ui.export.Spreadsheet` library, reading directly from the already-loaded Dashboard OData V4 data — no separate backend report object is introduced, per the Solution Component Selection Rules (avoid unjustified objects).
- **Fiori Launchpad:** tile `Z_PS_RFPEFFORT_TILE` launches the app; target mapping per the Prerequisites confirmed in the Solution Architect write-up.

## 9. Error Handling (Technical)
- **Message Class:** `ZPS_EFFORT`
  | No. | Text | Type |
  |---|---|---|
  | 001 | Effort must be zero or positive | Error |
  | 002 | Cost must be zero or positive | Error |
  | 003 | Mandatory field missing: &1 | Error |
  | 004 | No cost rate found for Module &1 / Role &2 — cost left blank for manual entry | Warning (informational, non-blocking; surfaced per FS's non-blocking requirement) |
  | 005 | Project must be marked "Won" before logging actuals | Error |
  | 006 | Invalid value for &1 | Error (server-side check of module, phase and entry type values; added in v1.1) |
- RAP validations raise these messages via the standard RAP message mechanism; OData V4 surfaces them as field-level errors, consumed by the SAPUI5 app as inline messages/message toast — matching FS Section 8's "on-screen inline message" notification strategy.
- **Exception Class:** `ZCX_PS_EFFORT` — reserved for unexpected/technical failures during rate lookup or determination processing (not user-facing business errors, which are handled via the message class above).
- **Logging:** No Application Log (BAL) or custom Z-log table — per FS Section 8a, no dedicated error report was required; all errors are transient and user-correctable at the point of entry.

## 10. Authorization Design
- **No custom authorization object and no code-level authorization checks.** This follows FS §9 (v1.1): any user who can open the app can mark an RFP as Won, and any user who can open the Cost Rate Master screen can maintain rates.
- **Access control is by role assignment only.** The four PFCG roles (`Z_PS_EFFORT_PRESALES`, `_DELIVERY`, `_PM`, `_TEAM`) grant start access to the `Z_UI_PSEFFRTHDR` service (the main app). Only the roles that should maintain rates (by default `Z_PS_EFFORT_DELIVERY`) are assigned the `Z_UI_PSEFFRTRATE` service. All four roles otherwise have equal read/write access, with cost visible to everyone who can see the RFP/project (FS §9).
- **Framework declaration.** Because the behavior definitions use `strict ( 2 )`, each declares `authorization master ( global )` (item: `authorization dependent`) and the matching global-authorization handler methods are present with empty bodies. They contain no checks by design.

## 10a. Transport Strategy
- One Workbench Request for PS-APP-001, covering all objects listed in Section 2c (package `ZPS_EFFORT`).
- No Customizing Request — no SPRO/customizing configuration is involved (per FS Section 10).
- Transport description must include the Requirement ID "PS-APP-001", per `config/naming-standards.json`'s `transportNamingNote`.

## 11. Performance Considerations
- No specific business SLA was requested (per confirmed answer) — standard Fiori/RAP performance practices apply.
- Given the confirmed "moderate volume" (hundreds of RFPs/projects, org-wide users), no buffering, parallelization, or special indexing strategy is required beyond standard CDS design.
- The Dashboard's Module x Phase comparison is served by a dedicated analytical CDS view (`Z_C_PSEFFRTDASH`) that performs `SUM(EFFORT_HOURS)`/`SUM(COST)` aggregation grouped by Module, Phase, and Entry Type, pushed down to the HANA database — this is the most efficient approach given the join/aggregation need across the header and item tables, avoiding client-side (UI5) aggregation.
- List/Detail screens read directly from the interface CDS views (`Z_I_PSEFFRTHDR`, `Z_I_PSEFFRTITM`) with standard OData V4 `$expand`/`$filter` — no additional data-source optimization needed at this volume.

## 12. Unit Test Design
| # | Test Case | Method/Class | Expected Result |
|---|---|---|---|
| 1 | Negative effort is rejected | `test_effort_negative_blocked` in `ZBP_I_PSEFFRTHDR` test class | Validation raises message 001; save blocked |
| 2 | Negative cost (manual entry) is rejected | `test_cost_negative_blocked` | Validation raises message 002; save blocked |
| 3 | Cost auto-calculates when a matching rate exists | `test_cost_autocalc_with_rate` | `COST = EFFORT_HOURS × RATE`; `COST_MANUAL_OVERRIDE = false` |
| 4 | Cost remains blank when no matching rate exists | `test_cost_blank_when_no_rate` | `COST` stays initial; no message raised; item still saves |
| 5 | Actual entry blocked while header status is "Estimate" | `test_actuals_blocked_when_not_won` | Validation raises message 005; save blocked |
| 6 | "Mark as Won" transitions header status correctly | `test_bo_mark_as_won`, `test_bo_actual_after_won` (run the real action against doubled tables) | `STATUS` changes from "Estimate" to "Won"; an actual line can then be saved |
| 7 | Mandatory field validation (header and item) | `test_mandatory_field_validation` | Validation raises message 003 for each missing mandatory field |

Test approach: ABAP Unit tests using the CDS Test Double Framework / EML-based test doubles for the RAP behavior pool, isolating each validation/determination/action from actual database persistence.

## 12a. Component Test Plan
| # | Acceptance Test Criteria | Master/Transactional Data Used | Expected Result | Actual Result |
|---|---|---|---|---|
| 1 | Create an RFP and add estimate lines across multiple modules/phases with valid effort, where a matching Cost Rate Master entry exists | Sample Cost Rate Master + new RFP/project data | Cost auto-calculates per line; RFP saves with Status = "Estimate"; visible on dashboard | _Pending execution in `/Code`_ |
| 2 | Mark an RFP as "Won" | Existing Estimate-status RFP | Status changes to "Won"; Actuals section becomes available | _Pending execution in `/Code`_ |
| 3 | Log actual effort, cost, and activity description against a "Won" RFP/project | Won-status RFP/project | Actual line saves; dashboard shows Estimate vs. Actual comparison | _Pending execution in `/Code`_ |
| 4 | Enter negative effort on an estimate or actual line | Any RFP/project | Save blocked with an on-screen error; no record saved | _Pending execution in `/Code`_ |
| 5 | Attempt to log actuals against an RFP still in Status = "Estimate" | Estimate-status RFP | Save blocked with an on-screen error | _Pending execution in `/Code`_ |
| 6 | Add an estimate line for a Module + Role combination with no matching Cost Rate Master entry | RFP/project + intentionally-missing rate combination | Cost field remains blank; user manually enters cost; line saves successfully | _Pending execution in `/Code`_ |

Test data ownership matches FS Section 11 (Presales/PMO leadership for Cost Rate Master data; Presales/Bid Manager test user for RFP/project data), to be provided before component test execution. Additional test conditions may be added later, in `/Code`, by the developer.

---
**Next step:** Run `/Code` referencing this document (Object ID: PS-APP-001) to build and unit-test the object.
