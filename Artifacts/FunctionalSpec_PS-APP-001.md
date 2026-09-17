# Functional Specification

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | PS-APP-001 |
| Object Name | Project & RFP Effort Management (Fiori App) |
| RICEFW Type | Custom Object (Custom Tables + CDS Views + RAP Business Object + OData V4 Service + Freestyle Fiori App) |
| Linked BRD Ref | BRD_ProjectRFPEffortManagement.md |
| Linked Solution Architect Ref | SolutionArchitect_ProjectRFPEffortManagement.md |
| Author | ankur.gupta04@nagarro.com |
| Version | 1.0 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-09-17 | ankur.gupta04@nagarro.com | Initial creation | Frozen |

## 2. Business Process Overview
A Presales/Bid Manager creates an RFP/project record and enters an effort-and-cost estimate broken down by SAP module and SAP Activate phase. Cost is auto-calculated from a maintained Cost Rate Master (by module and role) but can be manually overridden. Once the proposal is won, the Presales/Bid Manager marks the RFP as "Won," which unlocks actuals entry: project team members then log actual effort, cost, and a short activity description against the same module/phase breakdown. A dashboard compares estimate vs. actual, by module x phase and by RFP/project, org-wide. There is no formal approval gate — entries are saved directly and are visible for review on the dashboard.

## 2a. Business Impact & Affected Users
- **Affected roles:** Presales/Bid Manager, Practice/Delivery Lead, Project Manager, Project Team Member, Business Owner (PMO/Presales leadership).
- **Business impact if not delivered:** Effort/cost estimation and tracking continues manually in spreadsheets — slow consolidation, inconsistent estimates, no live estimate-vs-actual visibility, and less accurate RFP pricing.
- **Change management:** All four user roles need onboarding/training on the new app (estimate entry, marking an RFP "Won," actuals entry, and reading the dashboard); communication to presales/delivery teams that this replaces the manual spreadsheet process for new RFPs going forward.

## 3. Object Type & Purpose
Custom Object set delivering one integrated Fiori application:
- Custom Table — Estimate/Actual Line Items
- Custom Table — Cost Rate Master
- CDS Views (interface + analytical/dashboard)
- RAP Business Object (behavior logic: CRUD, cost calculation, status transition)
- OData V4 Service (RAP-generated)
- Custom Freestyle Fiori (SAPUI5) App

Purpose: replace manual spreadsheet-based RFP effort/cost estimation and actuals tracking with a single structured application, per BRD_ProjectRFPEffortManagement.md.

## 4. Trigger / Entry Point
- **Manual, user-initiated:** Presales/Bid Manager opens the Fiori app and creates a new RFP/project record.
- **Manual, user-initiated:** Presales/Bid Manager marks an RFP/project "Won," transitioning it from Estimate to actuals-tracking mode.
- **Manual, user-initiated, on-demand (no batch/schedule):** Project Team Members and Project Managers log actual effort/cost against a Won RFP/project, at whatever frequency they choose.

## 5. Input Specification

**Header (RFP/Project)**
| Field | Mandatory? | Source | Default Value |
|---|---|---|---|
| RFP/Project Name | Yes | Manual entry | — |
| Customer Name | Yes | Manual entry | — |
| Presales/Bid Manager (Owner) | Yes | Manual entry | Defaults to the creating user |
| Status | System-derived | System | "Estimate" |

**Line Item (shared structure for Estimate and Actual entries)**
| Field | Mandatory? | Source | Default Value |
|---|---|---|---|
| SAP Module | Yes | Manual selection (SD, MM, FI, CO, PP, QM, PM, PS, EWM, HCM) | — |
| SAP Activate Phase | Yes | Manual selection (Prepare, Explore, Realize, Deploy, Run) | — |
| Role | Yes | Manual selection (configurable, admin-maintained role list) | — |
| Effort (hours) | Yes | Manual entry | — |
| Cost | No (auto-populated where possible) | Auto-calculated from Cost Rate Master (Module + Role); manually overridable | Blank if no matching rate found |
| Activity Description | Yes for Actual lines; not applicable for Estimate lines | Manual free-text entry | — |
| Entry Type (Estimate/Actual) | System-derived | Derived from the screen/context the line was created in | — |

**Cost Rate Master (admin-maintained reference data)**
| Field | Mandatory? | Source | Default Value |
|---|---|---|---|
| SAP Module | Yes | Manual selection | — |
| Role | Yes | Manual selection (configurable list) | — |
| Rate | Yes | Manual entry | — |

## 6. Business Rules / Processing Logic
| # | Rule Type | Business Rule | Condition | Result / Action on Fail |
|---|---|---|---|---|
| 1 | Validation | Effort must be zero or positive | Effort < 0 | Error — blocks save |
| 2 | Validation | Cost must be zero or positive (when manually entered/overridden) | Cost < 0 | Error — blocks save |
| 3 | Calculation | Auto-calculate line cost | A matching Cost Rate Master entry exists for the line's Module + Role | Cost = Effort (hours) × Rate; populated automatically, remains user-editable |
| 4 | Derivation | No cost rate found | No Cost Rate Master entry matches the line's Module + Role | Cost field left blank; user may manually enter a cost for that line — no block, no warning |
| 5 | Validation | Header mandatory fields must be populated | RFP/Project Name, Customer Name, or Owner is blank | Error — blocks save |
| 6 | Validation | Line mandatory fields must be populated | Module, Phase, Role, or Effort is blank | Error — blocks save |
| 7 | Derivation | Status transition | Presales/Bid Manager manually marks the RFP/project "Won" | Status changes from "Estimate" to "Won"; Actuals entry becomes available; Estimate lines remain visible as read-only reference |
| 8 | Validation | Actuals entry requires "Won" status | An actual line is submitted while Status = "Estimate" | Error — blocks save, message states the RFP/project must be marked "Won" first |
| 9 | Process rule | No approval gate | Any Estimate or Actual line is saved | Line is saved directly and is immediately visible on the dashboard for review — no blocking approval step |

## 6a. Reference Objects (Standard SAP)
None. Per the Solution Architect write-up's Fit-Gap Outcome, this is a fully custom, self-contained solution with no dependency on existing standard SAP tables, BAPIs, IDocs, or transactions — no PS/CATS integration and no external system integration.

## 6b. SAP Data Mapping
Not applicable in the standard-SAP-reference sense — no existing SAP standard table, BAPI, or transaction holds this data; the entire data model is net-new, per the Solution Architect write-up's "What Will Be Built" object list (Section 5 there). The mapping this Functional Spec defines instead runs from the Input Specification (Section 5 above) and Output Specification (Section 7 below) to that new data model — the physical technical design (table/CDS field names, keys) is a `/TechnicalSpec` decision.

**Master Table Join Conditions:** Not applicable — no existing SAP master tables are involved.

**Field-Level Data Mapping:** Not applicable at this stage — see Section 10 (Technical Spec Input Notes); technical field names are decided in `/TechnicalSpec`.

## 7. Output Specification

**Screen-by-Screen Navigation**
1. User opens the "Project & RFP Effort Management" Fiori tile → lands on the RFP/Project List screen, showing all RFPs/projects org-wide (no default filter).
2. User selects "Create" → header entry screen (Name, Customer; Owner defaults to current user) → Save → returns to the List screen with the new record (Status = Estimate) and a success message.
3. User selects an RFP/project row → opens the Estimate Detail screen: a module x phase grid for entering/editing estimate line items (Module, Phase, Role, Effort; Cost auto-calculated or left blank for manual entry).
4. Presales/Bid Manager selects "Mark as Won" → confirmation dialog → on confirm, Status changes to "Won" with a success message, and the Actuals section becomes available.
5. User navigates to the Actuals tab (visible only when Status = "Won") → grid of actual line items (Module, Phase, Role, Effort, Cost, Activity Description) → Save → success message on success; an inline error (e.g., negative effort) blocks the save and highlights the offending field.
6. User navigates to the Dashboard (from the List screen, or per RFP/project) → a Module (rows) x Phase (columns) grid comparing Estimate vs. Actual effort and cost, with a toggle to an org-wide RFP/project summary view.
7. User selects "Export" on the Dashboard → downloads a consolidated report for the selected RFP(s)/project(s), using the same columns as the on-screen dashboard.

**Exact Columns/Fields Displayed (per screen)**
| Screen | Column/Field | Display Order | Sort/Grouping |
|---|---|---|---|
| RFP/Project List | RFP/Project Name | 1 | Sorted by Name, ascending (default) |
| RFP/Project List | Customer Name | 2 | — |
| RFP/Project List | Presales/Bid Manager (Owner) | 3 | — |
| RFP/Project List | Status (Estimate/Won) | 4 | Grouped by Status |
| Estimate Detail (grid) | SAP Module | 1 (row) | Grouped by Module |
| Estimate Detail (grid) | SAP Activate Phase | 2 (column) | Ordered Prepare → Explore → Realize → Deploy → Run |
| Estimate Detail (grid) | Role | 3 | — |
| Estimate Detail (grid) | Effort (hours) | 4 | — |
| Estimate Detail (grid) | Cost | 5 | — |
| Actuals (grid) | SAP Module | 1 (row) | Grouped by Module |
| Actuals (grid) | SAP Activate Phase | 2 (column) | Ordered Prepare → Explore → Realize → Deploy → Run |
| Actuals (grid) | Role | 3 | — |
| Actuals (grid) | Effort (hours) | 4 | — |
| Actuals (grid) | Cost | 5 | — |
| Actuals (grid) | Activity Description | 6 | — |
| Dashboard (Module x Phase) | Module | 1 (row) | Grouped by Module |
| Dashboard (Module x Phase) | Phase | 2 (column) | Ordered Prepare → Explore → Realize → Deploy → Run |
| Dashboard (Module x Phase) | Estimated Effort | 3 | — |
| Dashboard (Module x Phase) | Actual Effort | 4 | — |
| Dashboard (Module x Phase) | Estimated Cost | 5 | — |
| Dashboard (Module x Phase) | Actual Cost | 6 | — |
| Dashboard (RFP Summary, toggle view) | RFP/Project Name | 1 | Sorted by Name, ascending |
| Dashboard (RFP Summary, toggle view) | Total Estimated Effort / Cost | 2 | — |
| Dashboard (RFP Summary, toggle view) | Total Actual Effort / Cost | 3 | — |
| Dashboard (RFP Summary, toggle view) | Variance (Actual − Estimate) | 4 | — |

## 8. Error Handling & Messages
| # | Potential Error | Error Type | Notification Strategy | Notify Whom | Error Report Needed? |
|---|---|---|---|---|---|
| 1 | Negative effort or cost entered | Error | On-screen inline message; blocks save | Entering user | No |
| 2 | Mandatory header field missing (Name/Customer/Owner) | Error | On-screen inline message; blocks save | Entering user | No |
| 3 | Actuals entry attempted while Status = "Estimate" | Error | On-screen message; blocks save | Entering user | No |
| 4 | No Cost Rate Master entry found for the line's Module + Role | Warning (informational, non-blocking) | On-screen note; Cost field left blank for manual entry | Entering user | No |
| 5 | Mandatory line field missing (Module/Phase/Role/Effort) | Error | On-screen inline message; blocks save | Entering user | No |

## 8a. Error Reports Required
None — all error handling is via on-screen messages; no dedicated error report or notification workflow was requested.

## 9. Authorization Requirements
- All four roles (Presales/Bid Manager, Practice/Delivery Lead, Project Manager, Project Team Member) can view all RFPs/projects org-wide, per the confirmed data visibility answer.
- Cost figures are visible to everyone who can see the RFP/project — no restricted visibility, per the confirmed answer.
- ⚠️ Assumed: any Presales/Bid Manager (not only the RFP's own owner) can perform the "Mark as Won" transition, since visibility is org-wide rather than owner-restricted — confirm at `/TechnicalSpec` if a stricter, owner-only restriction is actually needed.
- ⚠️ Assumed: Practice/Delivery Leads also have Cost Rate Master maintenance access alongside an admin function — exact restriction to be confirmed during `/TechnicalSpec` authorization object design.
- Governed by the standard SAP authorization concept (PFCG roles/auth objects), per the Solution Architect write-up.

## 10. Assumptions, Dependencies & Technical Spec Input Notes

### Configuration Commitments Tracker
| Configuration Item | Commitment/Decision | Owner | Milestone Impact |
|---|---|---|---|
| None identified | No SPRO/customizing configuration needed — fully custom build | — | — |

### Technical Spec Input Notes
- RAP Business Object, CDS view, custom table (Estimate/Actual Line Items and Cost Rate Master), OData V4 service, and PFCG role technical design are all `/TechnicalSpec` decisions — not detailed here.
- The Module list (SD, MM, FI, CO, PP, QM, PM, PS, EWM, HCM) and Phase list (Prepare, Explore, Realize, Deploy, Run) should be modeled as fixed value lists — exact technical implementation (domain/fixed values vs. a small reference table) is a `/TechnicalSpec` decision.
- The Role list for the Cost Rate Master is configurable/admin-maintained — the technical design of that maintenance mechanism is a `/TechnicalSpec` decision.
- The "Mark as Won" authorization question flagged in Section 9 needs a technical-designer decision on the specific authorization check/object.

## 11. Test Scenarios (UAT-level)
| # | Scenario | Type (Positive/Negative) | Expected Result |
|---|---|---|---|
| 1 | Presales/Bid Manager creates a new RFP and adds estimate lines across multiple modules/phases with valid effort, where a matching Cost Rate Master entry exists | Positive | Cost auto-calculates per line; RFP saves with Status = "Estimate"; visible on the dashboard |
| 2 | Presales/Bid Manager marks an RFP as "Won" | Positive | Status changes to "Won"; the Actuals section becomes available |
| 3 | Project Team Member logs actual effort, cost, and an activity description against a "Won" RFP/project | Positive | Actual line saves; dashboard shows the Estimate vs. Actual comparison for that module/phase |
| 4 | User enters negative effort on an estimate or actual line | Negative | Save is blocked with an on-screen error; no record is saved |
| 5 | User attempts to log actuals against an RFP still in Status = "Estimate" | Negative | Save is blocked with an on-screen error stating the RFP/project must be "Won" first |
| 6 | User adds an estimate line for a Module + Role combination with no matching Cost Rate Master entry | Negative (edge case) | Cost field remains blank; user manually enters cost; the line saves successfully |

### Test Data Requirements
| Data Needed | Master/Transactional | Owner | Required By |
|---|---|---|---|
| Sample Cost Rate Master entries (several Module + Role combinations, plus at least one intentionally missing combination) | Master | Presales/PMO leadership (Business Owner) | Before component test execution |
| Sample RFP/project header and line item data, covering both "Estimate" and "Won"/Actuals states | Transactional | Presales/Bid Manager (test user) | Before component test execution |

---
**Next step:** Run `/TechnicalSpec` referencing this document (Object ID: PS-APP-001) to generate the Technical Specification.
