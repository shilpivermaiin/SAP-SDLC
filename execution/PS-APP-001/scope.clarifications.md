Profile: ARCHITECT
Role stated: Architect / PM (combined option; defaulted to more technical profile per ambiguity rule)
Date: 2026-09-17
---

## Scope Phase — Clarification Transcript (Requirement: PS-APP-001, Project/RFP Effort Management Fiori App)

**User (initial request):** Develop a SAP Fiori application for Project effort management

**AI:** Ran Scope skill Pre-Check — Existing BRD Guard: `Artifacts/` folder does not exist / no `BRD_*.md` found. Proceeding as a new requirement.

**AI (onboarding role-check):** Starting the Scope phase for the new 'Project Effort Management' Fiori app requirement. What's your role for this phase?
**User:** Architect / PM

### Clarification Round 1
1. How is project effort currently tracked today (As-Is)? → **Manual / Excel**
2. What's the primary pain point driving this request? → **Manual consolidation effort**
3. Who will be the primary users of this Fiori app? → **Both (team + PMs)**
4. What core capability should the app deliver (To-Be)? (multi-select) → **Log effort against tasks/WBS, Effort vs. plan dashboard, Reporting/export**
5. Priority (MoSCoW)? → **Must have**
6. Rough complexity sizing? → **Small**
7. Which projects/org units are in scope initially? → **All active projects, org-wide**
8. Which SAP business processes/modules are impacted? → **Other (free text): "Custom Fiori app Development for RFPs effort estimation in different phases across each SAP module"**

**AI:** Flagged answer #8 as a reframing of the requirement (RFP/proposal effort estimation across SAP modules and phases, not just live-project timesheet tracking) — a genuinely new blocking gap. Ran one focused follow-up round to reconcile.

### Clarification Round 2 (follow-up, reconciling the reframe)
1. Which best describes the intended use of this app? → **Both** (estimate effort for RFPs, then track actual effort against those estimates once the project runs)
2. What "phases" should effort be broken down by? → **SAP Activate phases** (Prepare, Explore, Realize, Deploy, Run)
3. Which SAP modules should the effort estimation cover? → **All core modules** (SD, MM, FI, CO, PP, QM, PM, PS, EWM, HCM, etc.)
4. Who are the primary users of this app? → **Both** (Presales/bid managers drive RFP estimation; practice/delivery leads contribute and approve module-level estimates; project teams/PMs track actuals once live)

**AI:** Compiled draft BRD (Requirement ID PS-APP-001) incorporating all answers above; flagged Business Owner/Requested By as assumed pending user confirmation. Presented for validation — not yet saved to `Artifacts/`.

**User (change request during validation):** include capability to add cost of the effort per module and per phase of the project

**AI:** Incorporated as an added in-scope capability — cost of effort captured per SAP module and per SAP Activate phase, alongside effort hours, at both RFP-estimate stage and actuals-tracking stage. Flagged the cost-rate mechanism (e.g., role-based rate card vs. resource-level rate) as an assumption to be defined at `/SolutionArchitect`, since that is a solution-design decision, not a BRD-level detail. Revised draft re-presented for validation — still not yet saved to `Artifacts/`.
