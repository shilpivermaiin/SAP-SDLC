# Business Requirement Document (High Level)

## 1. Document Control
| Field | Value |
|---|---|
| Requirement ID | PS-APP-001 |
| Requirement Name | Project & RFP Effort Management (Fiori App) |
| Requested By | ⚠️ Assumed: same as Author — please confirm |
| Business Owner | ⚠️ Assumed: Presales/PMO leadership — please confirm |
| Author | ankur.gupta04@nagarro.com |
| Version | 1.0 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-09-17 | ankur.gupta04@nagarro.com | Initial creation | Approved |

## 2. Requirement Summary
A custom SAP Fiori application to (a) estimate effort and cost for RFPs/proposals, broken down by SAP Activate phase (Prepare, Explore, Realize, Deploy, Run) and by SAP functional module, and (b) once a proposal is won and the project runs, track actual effort and cost against those estimates. Today this is done manually in spreadsheets, which is slow to consolidate and error-prone.

## 3. Business Objective
Replace manual, spreadsheet-based effort/cost estimation and tracking with a single, structured Fiori application so that presales/bid teams can produce consistent, module-and-phase-level effort and cost estimates for RFPs, and delivery teams can track actual effort and cost against those estimates once a project is live — improving estimate accuracy, cutting consolidation effort, and giving leadership real-time visibility into effort and cost burn vs. plan.

## 4. Current State (As-Is) & Pain Points
- Effort and cost estimates for RFPs, and actual project effort/cost, are all tracked manually in Excel spreadsheets, maintained independently by different contributors (module leads, PMs).
- Significant manual effort is spent consolidating inputs from multiple spreadsheets into a single view per RFP/project.
- No structured breakdown by SAP Activate phase or by module — estimates vary in format and granularity depending on who prepares them.
- No live comparison between what was estimated at RFP stage (effort or cost) and what is actually being spent once the project is running.

## 5. Desired Outcome (To-Be Vision)
A Fiori application where:
- Presales/bid managers can create an RFP effort and cost estimate, broken down across SAP Activate phases (Prepare, Explore, Realize, Deploy, Run) and across SAP functional modules (SD, MM, FI, CO, PP, QM, PM, PS, EWM, HCM, etc.).
- Practice/delivery leads contribute and approve the effort and cost estimate for their respective module(s).
- Once a proposal is won and the project starts, project teams log actual effort against tasks/WBS elements, with associated actual cost, and the app shows actual vs. original estimate for both effort and cost.
- Consolidated dashboards and exportable reports give leadership visibility into estimation accuracy and effort/cost burn, across all active RFPs and projects, org-wide.

## 6. Business Scope
### In Scope
- RFP/proposal effort and cost estimation, broken down by SAP Activate phase and by SAP module
- Practice/delivery lead review and approval of module-level effort and cost estimates
- Actual effort and cost tracking against tasks/WBS for won/live projects
- Effort and cost vs. plan (estimate vs. actual) dashboard
- Consolidated reporting/export across all RFPs and active projects, org-wide
- All core SAP modules (SD, MM, FI, CO, PP, QM, PM, PS, EWM, HCM, etc.)

### Out of Scope
- Detailed resource/named-individual scheduling or capacity planning (beyond effort hours and cost)
- Financial billing/invoicing based on tracked effort/cost
- Any module/phase list beyond the SAP Activate methodology and core modules named above, unless raised as a change later

## 7. Business Processes Impacted
- Presales / Bid Management
- Project Management / Project Systems
- Finance / Controlling (cost visibility)
- All core SAP functional modules named in scope (as estimation contributors, not as system integrations — that is a `/SolutionArchitect` decision)
- Fiori (delivery channel)

## 8. Key Business Stakeholders
| Role | Responsibility |
|---|---|
| Presales / Bid Manager | Creates and owns the overall RFP effort and cost estimate |
| Practice / Delivery Lead | Provides and approves module-level effort and cost estimates |
| Project Manager | Tracks actual effort and cost vs. estimate once the project is live |
| Project Team Member | Logs actual effort against tasks/WBS |
| Business Owner (PMO/Presales leadership) | Validates and prioritizes the solution |
| IT Team | Implementation |

## 9. Business Benefits & Priority
| Factor | Detail |
|---|---|
| Business Benefit | Efficiency (less manual consolidation), improved estimate accuracy, better visibility into effort and cost burn vs. plan, more accurate RFP pricing |
| Priority (MoSCoW) | Must have |
| Complexity | Small |

**Expected Benefits**
- Reduced manual effort consolidating estimates and actuals
- Consistent, structured effort and cost estimates across RFPs (by phase and module)
- Real-time visibility into estimate vs. actual, for both effort and cost
- Improved future estimation accuracy through historical comparison
- More accurate, defensible RFP pricing

## 10. Assumptions
- ⚠️ Assumed: "All core modules" means the standard SAP module set (SD, MM, FI, CO, PP, QM, PM, PS, EWM, HCM) — exact list to be confirmed/extended at `/SolutionArchitect`.
- ⚠️ Assumed: Business Owner and Requested By — pending confirmation (see Document Control).
- ⚠️ Assumed: Cost is derived by applying a cost rate (e.g., role-based rate card or resource-level rate) to logged/estimated effort — the exact rate source/mechanism is a solution-design decision to be defined at `/SolutionArchitect`, not a BRD-level detail.
- SAP Activate is the accepted phase model for all RFPs and projects using this app.

## 11. Constraints
- None stated by the user at this time.
