Profile: BUSINESS_SEMI_TECHNICAL
Role stated: Business user / Business Analyst
Date: 2026-09-17
---

# Scope Phase — Clarification & Transcript Log — MM-RPT-002 (Multilevel BOM Excel Export Report)

## Onboarding Role Check
- Q: Starting /Scope for this new requirement (multilevel BOM export). Quick check — what's your role for this phase?
  - A: Business user / BA
- Q: How comfortable are you with SAP-specific technical terms (tables, BAdIs, transports, etc.)?
  - A: Somewhat comfortable
- Resulting profile: BUSINESS_SEMI_TECHNICAL

## Initial Business Need (verbatim, as provided by user)
"Creation of a new custom report to export BOM data in excel format. A new report to export multilevel BOM data in excel format (xlsx or xls[DP1.1]) is needed... [full requirement description with selection screen fields MATNR/WERKS/Valid from, output destination options (application server via logical path / local file with same naming convention), multilevel explosion behavior, and dedicated-section-per-Level-0-material rule]."

## Clarification Round 1
- Q: Which business area does this BOM export requirement primarily belong to (for scoping and the requirement ID)?
  - A: Materials Management (MM)
- Q: What's the current pain point this report replaces — how do people get multilevel BOM data into Excel today?
  - A: No export today — users manually re-key/compile BOM levels from SAP screens into Excel
- Q: Who are the intended users/stakeholders of this report?
  - A: Production Planners / MRP Controllers; Engineering / PLM team
- Q: What's the organizational scope — which plants/company codes should this report cover?
  - A: Not yet defined

## Draft BRD (v1) presented to user — user asked to consider an uploaded reference document

## Reference Document Provided
User uploaded `Functional_and_technical_description_2000024053.docx` — a Siemens TDD (Technical Design Document) covering both the Functional and Technical sections for this same requirement (ITR 2000024053-3100). Extracted and preserved at `execution/MM-RPT-002/reference/TDD_Reference_ITR2000024053.md` (structured) and `raw_extract.txt` (raw). Key business-relevant facts pulled from it into the BRD:
- Requested By / functional author: Daniel Proteasa
- Business/SAP Service Owner: May Andreas (Integration Manager)
- Owning team stated in source doc: PP (Production Planning)
- Business purpose: exported BOM data also feeds a downstream Teamcenter (PLM) system integration
- Several output classification/mapping rules noted in the source doc as pending final confirmation by the business (Siemens)

## Clarification Round 2 (conflict raised by reference document)
- Q: The source document's header/version table both say Team: PP (Production Planning), but the requirement was earlier classified as MM. Which module code should the Requirement ID use going forward?
  - A: MM (Materials Management) — Requirement ID kept as MM-RPT-002

## Draft BRD (v2) — updated with real stakeholder names and Teamcenter business context — presented to user

## Validation
- User response: "ok" — treated as explicit confirmation of the draft BRD.

## Assumptions made (flagged in BRD, none overridden by user)
- Org/plant scope not formally defined — plant is a runtime selection input
- Report runs on-demand, not scheduled
- Read-only extraction, no BOM maintenance
- Some output classification/mapping rules pending business confirmation (per source doc)
- No measurable KPI/target provided — benefit stated qualitatively
- Complexity assessed as Complex (multiple data sources, custom determination rules, formatting requirements) — pending refinement at Solution Architect sizing
