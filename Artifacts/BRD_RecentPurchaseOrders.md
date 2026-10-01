# Business Requirement Document (High Level)

## 1. Document Control
| Field | Value |
|---|---|
| Requirement ID | MM-RPT-001 |
| Requirement Name | Recently Created Purchase Orders View |
| Requested By | Not provided |
| Business Owner | Not provided |
| Author | Not provided |
| Version | 1.0 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-10-01 | Not provided | Initial creation | Frozen |

## 2. Requirement Summary
Procurement users need an application that shows the purchase orders (POs) created in SAP over the last 30 days, with one line per PO.

## 3. Business Objective
Give buyers a quick, reliable view of newly raised POs, so they can monitor recent purchasing activity without building the list by hand.

## 4. Current State (As-Is) & Pain Points
- ⚠️ Assumed, please confirm: Buyers currently have no single, ready-made view of recently created POs. They search or compile the list manually.
- No pain points were quantified (time lost, errors, manual effort).

## 5. Desired Outcome (To-Be Vision)
- Buyers open one application and see every PO created in the last 30 days.
- Each PO appears on a single line.
- The list covers all company codes and plants the user is authorised to see.

## 6. Business Scope
### In Scope
- Display of POs created in SAP within the last 30 days
- One line per PO (header-level information)
- Coverage of all company codes and plants

### Out of Scope
- Item-level detail per PO
- Creating, changing, approving or deleting POs
- POs older than the 30-day window

## 7. Business Processes Impacted
- Procurement / Purchasing (MM)

## 8. Key Business Stakeholders
| Role | Responsibility |
|---|---|
| Business Owner | Not provided |
| Process Owner / Primary Users | Procurement / buyers, who use and validate the view |
| IT Team | Implementation |

## 9. Business Benefits & Priority
| Factor | Detail |
|---|---|
| Business Benefit | Efficiency and visibility |
| Priority (MoSCoW) | ⚠️ Assumed: Should |
| Complexity | ⚠️ Assumed: Small |

**Expected Benefits**
- Better visibility of recent purchasing activity
- Less manual effort to compile recent POs
- Faster follow-up by buyers

## 10. Assumptions
- ⚠️ "Last 30 days" means a rolling window: today and the 30 days before it, based on each PO's creation date.
- ⚠️ "One line per PO" shows the key facts a buyer would expect (PO number, vendor, creation date, value, status). Exact fields are decided in `/FunctionalSpec`.
- ⚠️ Users only see POs they are authorised to see.

## 11. Constraints
- None provided.
