# Functional Specification

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | MM-RPT-001 |
| Object Name | Recently Created Purchase Orders View |
| RICEFW Type | Report (read-only list application, with data access restriction) |
| Linked BRD Ref | [BRD_RecentPurchaseOrders.md](BRD_RecentPurchaseOrders.md) |
| Linked Solution Architect Ref | [SolutionArchitect_RecentPurchaseOrders.md](SolutionArchitect_RecentPurchaseOrders.md) |
| Author | Not provided |
| Version | 1.1 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-10-01 | Not provided | Initial creation | Frozen |
| 1.1 | 2026-10-01 | Not provided | Access restriction changed from company code/plant to standard purchasing authorisation (purchasing organisation, purchasing group, PO type), at the user's request during `/TechnicalSpec`. Rules 1 and 5, Sections 5, 9, 10 and 11 updated. Two points previously left for the technical designer (PO identification, release status values) confirmed on the system. | Frozen |

## 2. Business Process Overview
Procurement buyers open one application that lists every purchase order (PO) created in SAP in the last 30 days, one line per PO, so they can monitor newly raised purchasing activity without compiling the list by hand. The list is read-only. It covers every PO the user is authorised to see under standard purchasing authorisation (purchasing organisation, purchasing group and PO type).

Reuse and gap: SAP's standard PO list was assessed in the Solution Architect write-up. It does not guarantee the exact one-line-per-PO layout with a default last-30-days window, so a small custom application fills that gap.

## 2a. Business Impact & Affected Users
- **Affected roles:** Procurement / buyers (primary users).
- **Impact if not delivered:** buyers keep searching for or compiling recent POs manually, with less visibility of recent purchasing activity and slower follow-up.
- **Change management:** a short note to buyers on where to find the app and what each column means. No process change, since the app is read-only.

## 3. Object Type & Purpose
A read-only list application. Purpose: show POs created in the last 30 days at one line per PO.

## 4. Trigger / Entry Point
The buyer opens the application from their SAP launchpad. Data is read on demand each time the application is opened or refreshed. There is no background job or inbound call.

## 5. Input Specification
| Field | Mandatory? | Source | Default Value |
|---|---|---|---|
| Creation-date window | n/a (not user-editable) | System date | Last 30 days: today and the 30 days before it, based on each PO's creation date |
| Purchasing authorisations | n/a (not user-editable) | User's authorisations | All POs the user is authorised to see |

The user supplies no input and has no filters.

## 6. Business Rules / Processing Logic
| # | Rule Type | Business Rule | Condition | Result / Action on Fail |
|---|---|---|---|---|
| 1 | Validation | Only purchase orders are listed | Document is a purchase order (document category F), not another purchasing document | Other documents are excluded |
| 2 | Validation | Only POs in the last 30 days are listed | PO creation date is within the last 30 days, inclusive of the day exactly 30 days ago and today | POs outside the window are excluded |
| 3 | Validation | Users see only POs they are authorised for under standard purchasing authorisation | User is authorised for the PO's purchasing organisation, purchasing group and PO type | Unauthorised POs are not shown |
| 4 | Derivation | Total net value of a PO is the sum of its item net values, in the PO currency | Always, per PO | No conversion across currencies |
| 5 | Derivation | Approval (release) status is taken from the PO's release information | PO has a release status | If no release status applies, the column is shown blank. Release values in use on the system: B (not yet released) and R (released) |
| 6 | Validation | POs flagged for deletion remain in the list | ⚠️ Assumed: BRD says every PO created in the window | Listed like any other PO |
| 7 | Validation | List is sorted by creation date, newest first | Always | n/a |

## 6a. Reference Objects (Standard SAP)
| Object Type | Object Name | Purpose in this process |
|---|---|---|
| Table | `EKKO` (Purchasing Document Header) | PO number, creation date, created by, vendor, company code, purchasing org, currency, release status, document category |
| Table | `EKPO` (Purchasing Document Item) | Item net values summed into the PO total |
| Table | `LFA1` (Vendor Master, General) | Vendor name |

## 6b. SAP Data Mapping

**Master Table Join Conditions**
| Master Table (Business Name) | Technical Table Name | Business Purpose | Joins To | Join Condition (Business Key) | Technical Join Fields | Cardinality |
|---|---|---|---|---|---|---|
| Purchasing Document Header | `EKKO` | One row per PO | `EKPO` | Same PO number | `EKKO`-`EBELN` = `EKPO`-`EBELN` | 1 : many |
| Purchasing Document Header | `EKKO` | One row per PO | `LFA1` | Same vendor number | `EKKO`-`LIFNR` = `LFA1`-`LIFNR` | many : 1 |

**Field-Level Data Mapping**
| Output Column | Source Table (Business Name) | Technical Table Name | Source Field (Business Name) | Technical Field Name | Header/Item Level | Derivation Rule |
|---|---|---|---|---|---|---|
| PO number | Purchasing Document Header | `EKKO` | Purchasing document number | `EBELN` | Header | Direct |
| Creation date | Purchasing Document Header | `EKKO` | Date record created | `AEDAT` | Header | Direct; used for the 30-day window |
| Created by | Purchasing Document Header | `EKKO` | Name of person who created the object | `ERNAM` | Header | Direct |
| Vendor number | Purchasing Document Header | `EKKO` | Vendor account number | `LIFNR` | Header | Direct |
| Vendor name | Vendor Master (General) | `LFA1` | Name 1 | `NAME1` | Header | Looked up by vendor number |
| Company code | Purchasing Document Header | `EKKO` | Company code | `BUKRS` | Header | Direct |
| Purchasing organisation | Purchasing Document Header | `EKKO` | Purchasing organisation | `EKORG` | Header | Direct |
| Total net value | Purchasing Document Item | `EKPO` | Net order value in PO currency | `NETWR` | Item | Sum over the PO's items |
| Currency | Purchasing Document Header | `EKKO` | Currency key | `WAERS` | Header | Direct; shown with the total |
| Approval (release) status | Purchasing Document Header | `EKKO` | Release indicator | `FRGKE` | Header | Direct; values in use on the system: B (not yet released), R (released) |
| PO-only filter (rule 1) | Purchasing Document Header | `EKKO` | Purchasing document category | `BSTYP` | Header | Value F = Purchase Order (confirmed on the system) |

All field names above were verified on the connected SAP system (PS4_110).

## 7. Output Specification

**Screen-by-Screen Navigation**
1. The buyer opens the application from the launchpad. The list opens immediately, already restricted to the last 30 days, sorted newest first.
2. The list shows one line per PO. There is no second screen, no drill-down, and no create, change, approve or delete action.
3. If no POs exist in the window, the list shows an empty-result message (see Section 8). If the data cannot be read, an error message is shown instead of the list.

**Exact Columns/Fields Displayed (per screen)**
| Screen | Column/Field | Display Order | Sort/Grouping |
|---|---|---|---|
| PO list | PO number | 1 | None |
| PO list | Creation date | 2 | Sorted descending (newest first) |
| PO list | Created by | 3 | None |
| PO list | Vendor (number and name) | 4 | None |
| PO list | Company code | 5 | None |
| PO list | Purchasing organisation | 6 | None |
| PO list | Total net value with currency | 7 | None |
| PO list | Approval (release) status | 8 | None |

## 8. Error Handling & Messages
| # | Potential Error | Error Type | Notification Strategy | Notify Whom | Error Report Needed? |
|---|---|---|---|---|---|
| 1 | No POs created in the last 30 days | Warning | On-screen message: "No purchase orders were created in the last 30 days" | The user | No |
| 2 | User has no PO authorisation | Error | Rows not shown; standard no-authorisation message | The user | No |
| 3 | Data cannot be read (system problem) | Fatal | On-screen error with a retry option; normal system monitoring | The user, and the Basis team through system monitoring | No |

## 8a. Error Reports Required
| Error Report Name | Linked Error(s) | Status |
|---|---|---|
| None required | n/a | n/a |

## 9. Authorization Requirements
- Buyers need access to the application and display authorisation for purchase orders.
- Each user sees only POs they are authorised for under standard purchasing authorisation: purchasing organisation, purchasing group and PO type (display activity). Company code and plant are not used to restrict the list.
- Developers and Basis/Security roles are covered in the Solution Architect write-up and `/TechnicalSpec`.

## 10. Assumptions, Dependencies & Technical Spec Input Notes
**Assumptions**
- ⚠️ POs flagged for deletion are still listed (rule 6).
- ⚠️ Total net value is the sum of item net values in the PO currency, with no cross-currency conversion (rule 4).
- ⚠️ Volume and response expectations were not provided. Assumed: a modest 30-day volume, normal on-screen response, on-demand use.
- ⚠️ Author and business owner names were not provided.

**Change Log**
- 2026-10-01 (v1.1): at the user's request during `/TechnicalSpec`, the access restriction changed from company code/plant to standard purchasing authorisation, because the standard released purchase-order data already enforces purchasing organisation, group and PO type and a PO header has no plant. Applied to this FS only. The BRD and Solution Architect write-up still say "company codes and plants" in their wording and were intentionally left unchanged at the user's direction. Nothing has been built, so there is no rebuild or re-test impact.

**Dependencies**
- Procurement lead: design sign-off and test data.
- Basis / Security: launchpad access and roles (per the Solution Architect write-up).

### Configuration Commitments Tracker
| Configuration Item | Commitment/Decision | Owner | Milestone Impact |
|---|---|---|---|
| Launchpad access to the application | Tile and role assignment for buyers | Basis / Security | None identified |

### Technical Spec Input Notes
- Decide how the total net value is derived at scale, and how the sorted, windowed read is made efficient.
- Naming and object design are decided in `/TechnicalSpec`.

## 11. Test Scenarios (UAT-level)
| # | Scenario | Type | Expected Result |
|---|---|---|---|
| 1 | A PO created 5 days ago in an authorised purchasing organisation | Positive | PO appears with all eight columns filled |
| 2 | A PO created exactly 30 days ago | Positive | PO appears (window includes day 30) |
| 3 | A buyer authorised for some purchasing organisations only | Positive | Only POs from those purchasing organisations are listed |
| 4 | A PO created 31 days ago | Negative | PO does not appear |
| 5 | A buyer with no PO authorisation opens the app | Negative | No rows; standard no-authorisation message |
| 6 | No POs exist in the last 30 days | Negative | Empty-result message is shown |

### Test Data Requirements
| Data Needed | Master/Transactional | Owner | Required By |
|---|---|---|---|
| POs created 5 days ago, exactly 30 days ago and 31 days ago | Transactional | Procurement lead | Before component test |
| POs in an authorised and an unauthorised purchasing organisation | Transactional | Procurement lead | Before component test |
| Test users with and without PO authorisation | Master | Basis / Security | Before component test |

---
**Next step:** Run `/TechnicalSpec` referencing this document (Object ID: MM-RPT-001) to generate the Technical Specification.
