# Technical Specification

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | MM-RPT-001 |
| Object Name (Technical) | Package `ZMM_RECENTPO` (see Section 2c for the full object list) |
| RICEFW Type | Report (read-only list application, with inherited data access control) |
| Linked Functional Spec Ref | [FunctionalSpec_MM-RPT-001.md](FunctionalSpec_MM-RPT-001.md) (v1.1) |
| Linked Solution Architect Ref | [SolutionArchitect_RecentPurchaseOrders.md](SolutionArchitect_RecentPurchaseOrders.md) |
| Author | Not provided |
| Version | 1.0 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-10-01 | Not provided | Initial creation | Frozen |

## 2. Development Object Overview
- **Object type:** read-only Fiori Elements list application on a RAP-style OData V4 UI service over CDS view entities. There is no custom ABAP program and no behaviour implementation.
- **Naming:** derived from `config/naming-standards.json`. Two patterns had no entry (access control, launchpad catalog) and were added to that file for this requirement, per its governance rule.
- **Package:** `ZMM_RECENTPO`, a new package distinct from the existing `ZMM_OPENPO`, which belongs to a different requirement that also carries the ID MM-RPT-001.
- **Transport:** see Section 10a.
- **System facts (read from PS4 on 2026-10-01):** ABAP release 816, S/4HANA On-Premise. RAP/CDS, UI5/Fiori deployment, launchpad customisation and transports are all available. This closes the SA write-up's open points on release level, Fiori availability and developer access.

## 2a. Reuse Assessment (Revisited)
| Check | AI Finding | User Response | Status | Notes |
|---|---|---|---|---|
| Another FS/TS for 1SAP with predominantly the same functionality? (all WRICEF inventories considered) | None. No other FS/TS in `Artifacts/`. An "Open Purchase Orders" app on PS4 (package `ZMM_OPENPO`, item-level open items) is a different function and cannot give a header-level one-line-per-PO list. | ✅ Accepted (first selected as rejected, then confirmed as a mistaken selection) | Accepted | The existing app's objects are not reused or changed |
| WRICEF previously developed in another system? | No evidence found on PS4 | ✅ Accepted | Accepted | |

## 2b. Clean Core Assessment (Mandatory)
| Check | AI Finding | User Response | Status | Notes |
|---|---|---|---|---|
| Prefer released APIs, RAP, CDS, ABAP Cloud over classic techniques? | Yes. Released CDS views, a read-only OData V4 UI service and Fiori Elements. | ✅ Accepted (first selected as rejected, then confirmed as a mistaken selection) | Accepted | Approach fixed in the Solution Architect write-up |
| Any direct modification of an SAP standard object? (must be avoided) | None. Only new custom objects in a new package. | ✅ Accepted | Accepted | |
| Any unreleased/non-strategic API used? (must be avoided, or justified if unavoidable) | None. Only the released PO view, the released PO item view and the released supplier view are used. The non-released PO view and its calculated-field views are deliberately not used. | ✅ Accepted | Accepted | Released status read on PS4 |

> **User Response** legend: ✅ Accepted / ❌ Rejected / ⚪ No response / `N/A — approach fixed in Solution Architect write-up`.

## 2c. Object Inventory & Impacted Components
| Object Name | Type | New or Impacted (Existing) | Description |
|---|---|---|---|
| `ZMM_RECENTPO` | Package | New | Development package for this requirement |
| `Z_I_RECENTPONETAMOUNT` | CDS view entity (aggregation) | New | Sums item net amounts per PO, limited to the 30-day window |
| `Z_I_RECENTPURCHASEORDER` | CDS view entity (interface) | New | One row per PO: released PO header data, net total and supplier name |
| `Z_C_RECENTPURCHASEORDER` | CDS view entity (consumption) | New | Applies the rolling 30-day window and exposes the eight FS columns |
| `Z_C_RECENTPURCHASEORDER_MDE` | Metadata extension | New | Column order, default sort, display labels; no user filters |
| `Z_C_RECENTPURCHASEORDER` | Access control | New | Inherits the standard PO access control |
| `Z_UI_RECENTPURCHASEORDER` | Service definition | New | Exposes the consumption view |
| `ZRECENTPURCHASEORDER_O4` | Service binding (OData V4 UI) | New | Publishes the read-only service |
| `zmm.recentpo` | Fiori Elements list report app | New | The application buyers use |
| `Z_MM_RECENTPO_TILE` / `Z_MM_RECENTPO_CAT` | Launchpad tile / catalog | New | Launchpad access |
| `Z_MM_RECENTPO` | Role | New | Role carrying the app and service access |
| `ZCL_MM_RECENTPO_TEST` (local `LTC_RECENTPO`) | Test host class | New | ABAP Unit with CDS test doubles |
| Released PO, PO item and supplier views | CDS views | Existing (read only) | Standard data sources, not changed |

## 3. Build Approach
- **Approach:** CDS view entities, a read-only OData V4 UI service and a Fiori Elements list report (the RAP/CDS stack without a behaviour definition, because the app is read-only).
- **Justification:** fixed in the Solution Architect write-up (SAP standard first, Clean Core, custom Fiori list app). The Clean Core assessment above finds the approach compliant.
- **SAP standard UI style:** Fiori Elements generates the standard list report layout, so there is no freestyle UI or modification.

## 4. Data Model
No new tables, structures or appends.

| Object | Type | Fields | Key Fields |
|---|---|---|---|
| `Z_I_RECENTPONETAMOUNT` | CDS aggregation | PO number, document currency, total net amount (sum of item net amounts) | PO number |
| `Z_I_RECENTPURCHASEORDER` | CDS interface view | PO number, creation date, created by, supplier number, supplier name, company code, purchasing organisation, document currency, total net amount, release status, deletion code | PO number |
| `Z_C_RECENTPURCHASEORDER` | CDS consumption view | The eight FS columns | PO number |

## 4a. Program Definition(s)
| Field | Program 1 |
|---|---|
| Common or New Program? | None. No custom program is built. |
| Application | MM (Purchasing) |
| Development Class | `ZMM_RECENTPO` |
| Authorization Group | Not applicable |
| SAP Transaction(s) | None. Access is through the launchpad tile only. |
| Program Description | Not applicable. The solution is declarative (views, service, app). |
| Input/Output Files | None |
| Program Flow | See Section 5 |

## 5. Program / Processing Logic Design
**Flow:** buyer opens the tile → app calls the OData V4 service → service reads the consumption view → the consumption view applies the rolling 30-day window on creation date → the interface view reads the released PO view (access control applied by inheritance), joins the net-total helper view and the released supplier view → the app shows the rows sorted by creation date, newest first.

| FS Rule Ref | Business Rule (from FS) | Technical Implementation |
|---|---|---|
| 1 | Only purchase orders are listed | The released PO view only returns purchase orders (document category F) and also excludes aged POs and POs blocked for end-of-purpose. See FS follow-up 1 in Section 6a. |
| 2 | Only POs created in the last 30 days (inclusive) | Consumption-view filter: creation date on or after the system date minus 30 days, and on or before the system date. The exact supported date-arithmetic expression is chosen in `/Code`. The same window is applied in the net-total helper view. |
| 3 | Users see only POs they are authorised for | The access control on the consumption view inherits the standard PO access control, which checks purchasing organisation, purchasing group and PO type (display activity). No custom authorisation object. |
| 4 | Total net value = sum of item net values, in PO currency | The helper view sums the released item view's net amount per PO and currency. A PO with no items shows 0. See FS follow-up 2 in Section 6a. |
| 5 | Approval status from the PO's release information | The release fields on the released PO view are shown as text. R (released) and B (not yet released) are the values in use on PS4. Blank if no release applies. |
| 6 | POs flagged for deletion remain listed | No deletion filter is applied. The deletion code is carried in the interface view for reference. |
| 7 | Newest first | Default sort annotation on creation date, descending, in the metadata extension. |

## 6. Reference Objects Used (from FS Section 6a + any additional technical ones)
| Object Type | Object Name | Usage |
|---|---|---|
| CDS view (released, C1) | `I_PurchaseOrderAPI01` | PO header data (read-only) |
| CDS view (released, C1) | `I_PurchaseOrderItemAPI01` | Item net amounts for the PO total |
| CDS view (released, C1) | `I_Supplier` | Supplier name |
| Table (via the views, not accessed directly) | `EKKO`, `EKPO`, `LFA1` | Underlying standard data, as listed in the FS |

### 6a. FS follow-ups (logged, no FS change made here)
1. **Aged and end-of-purpose-blocked POs:** the standard released PO view excludes them. The FS does not mention this. It affects the list only if such POs exist.
2. **Deleted items in the total:** the FS says "sum of item net values". It is implemented literally, so deleted items count. The FS does not say whether they should.

## 7. Interface / Integration Design
Not applicable. There are no external systems or interfaces.

## 8. UI / Output Technical Design
- **App type:** Fiori Elements list report (OData V4), one screen, no object page, no actions.
- **Columns (order from FS Section 7):** PO number, creation date, created by, supplier (number and name), company code, purchasing organisation, total net value with currency, approval status.
- **Selection:** no selection fields or filters are exposed, per the FS.
- **Sorting:** creation date descending as the default presentation.
- **Empty list:** the FS text "No purchase orders were created in the last 30 days" is set using the Fiori Elements-supported mechanism for a custom no-data text. The exact mechanism is verified in `/Code`.
- **Service:** read-only, no behaviour definition, queries only.

## 9. Error Handling (Technical)
- **Exception classes / message class:** none. There is no custom ABAP, so no exception classes and no message class are needed.
- **No POs in the window:** custom empty-list text (Section 8).
- **No authorisation:** the standard access control returns no rows, and standard service authorisation errors show the standard Fiori message.
- **System/read failure:** the standard Fiori error message with the standard retry. Basis monitoring uses the normal system tools.
- **Logging:** no custom application log or log table.

## 10. Authorization Design
- **No custom authorisation objects.**
- **Data access:** inherited standard access control. The standard PO mapping role checks purchasing document type (`M_BEST_BSA`), purchasing organisation (`M_BEST_EKO`) and purchasing group (`M_BEST_EKG`), each for display activity 03.
- **Service/app access:** the new role `Z_MM_RECENTPO` carries the launchpad catalog and service authorisation defaults. Buyers are assigned this role plus the standard PO display authorisations above.
- **Owner:** Security team assigns the roles. Basis activates the launchpad content.

## 10a. Transport Strategy
- **Workbench request:** one for all development objects (package, views, access control, service definition and binding, Fiori app, test class). Description includes `MM-RPT-001` and "Recent POs", so it cannot be confused with the other requirement that carries the same ID.
- **Customizing request:** one for the launchpad tile/catalog and the role, which are configuration objects.
- **Package:** `ZMM_RECENTPO`.

## 11. Performance Considerations
- **Volume:** PS4 has 26 POs in the current 30-day window. Production volume was not provided and is assumed modest.
- **Response estimate:** well under a few seconds at this volume. To be verified in component test.
- **Data source:** released CDS views over standard PO data. No custom tables.
- **Pull method:** the 30-day filter on creation date is applied in the consumption view so the database filters early (CDS pushdown). The net-total helper view aggregates only items of POs in the same window, so it doesn't scan all items.
- **Paging and sorting:** the service uses standard paging and server-side sort on creation date.
- **No `SELECT *`, no nested database access, no loops**, since there is no custom ABAP.

## 12. Unit Test Design
Host class `ZCL_MM_RECENTPO_TEST` with local test class `LTC_RECENTPO`, using CDS test doubles on the released source views. The feasibility of doubling the released views is confirmed in `/Code`.

| # | Test Case | Method/Class | Expected Result |
|---|---|---|---|
| 1 | A PO created today | `LTC_RECENTPO` / today-included | PO appears |
| 2 | A PO created exactly 30 days ago | `LTC_RECENTPO` / day30-included | PO appears |
| 3 | A PO created 31 days ago | `LTC_RECENTPO` / day31-excluded | PO does not appear |
| 4 | A PO with several items | `LTC_RECENTPO` / net-total-sums-items | Total equals the sum of item net amounts, in the PO currency |
| 5 | A PO with no items | `LTC_RECENTPO` / no-items-total-zero | PO is listed with a total of 0 |
| 6 | Release values B and R | `LTC_RECENTPO` / release-status-text | B and R map to the expected status text |
| 7 | A PO flagged for deletion | `LTC_RECENTPO` / deleted-still-listed | PO is listed |

Authorisation (FS rule 3), sort order and the empty-list text depend on real authorisation and the app, so they are covered in the component test plan and not by unit tests.

## 12a. Component Test Plan
> Acceptance test for the whole work unit. No integration testing at this stage. Additional test conditions may be added later, in the code phase, by the developer.

| # | Acceptance Test Criteria | Master/Transactional Data Used | Expected Result | Actual Result |
|---|---|---|---|---|
| 1 | FS scenario 1: PO created 5 days ago in an authorised purchasing organisation appears with all eight columns filled | PO created 5 days ago (Procurement lead) | PO appears, all columns filled | |
| 2 | FS scenario 2: PO created exactly 30 days ago appears | PO created exactly 30 days ago | PO appears | |
| 3 | FS scenario 3: buyer authorised for some purchasing organisations only sees only those POs | POs in an authorised and an unauthorised purchasing organisation; test user | Only authorised POs are listed | |
| 4 | FS scenario 4: PO created 31 days ago does not appear | PO created 31 days ago | PO does not appear | |
| 5 | FS scenario 5: user with no PO authorisation sees no rows | Test user without PO display authorisation | No rows; standard no-authorisation message | |
| 6 | FS scenario 6: empty window shows the empty-list text | A system or user context where no PO falls in the window | "No purchase orders were created in the last 30 days" | |
| 7 | List is sorted newest first | Several POs with different creation dates | Order is descending by creation date | |
| 8 | Response time at the available volume | Current PS4 data | Opens within normal interactive response | |

---
**Next step:** Run `/Code` referencing this document (Object ID: MM-RPT-001) to build and unit-test the object.
