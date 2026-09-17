Profile: ARCHITECT
Role stated: Architect / PM (combined option; defaulted to more technical profile per ambiguity rule)
Date: 2026-09-17
---

## Functional Spec Phase — Clarification Transcript (Requirement: PS-APP-001)

**AI:** Source Discovery — found `Artifacts/SolutionArchitect_ProjectRFPEffortManagement.md` and `Artifacts/BRD_ProjectRFPEffortManagement.md`, both read in full.

**AI (onboarding role-check):** Starting FunctionalSpec for PS-APP-001. What's your role for this phase?
**User:** Architect / PM

### Entry Criteria & Reuse Assessment
- Reuse assessed: ✅ Yes — Solution Architect Fit-Gap concluded no standard SAP object/report/app exists for this need; full custom build required.
- Gap analysis performed: ✅ Yes — documented in SolutionArchitect write-up Section 4.
- Related BRD completed: ✅ Yes — BRD_ProjectRFPEffortManagement.md, Approved.
- Design owner identified: pending — to ask user.

### Ask the User — Batch 1 (Trigger/Lifecycle, Actuals Granularity, Approval)
1. How does an RFP move from "estimate" to "actuals tracking" stage? → **Manual status change** (Presales/Bid Manager marks it "Won")
2. Actuals logging granularity? → **Module + Phase + free-text activity**
3. Should entries require approval before being final? → **No approval workflow**

**AI:** Flagged that "No approval workflow" contradicts what's frozen in the BRD (In Scope: "Practice/delivery lead review and approval...") and the Solution Architect write-up (RAP BO purpose: "module-lead approval status") — a Cross-Phase Change Propagation case per CLAUDE.md Principle 9a. Asked the user how to handle it.

**User:** Propagate the drop everywhere.

**AI:** Updated both frozen upstream artifacts in place, each with a new Version History row (BRD → v1.1, SolutionArchitect → v1.1), removing the approval step and replacing it with "estimates visible for review, no formal approval gate." No `/Code` or `/Testing` artifacts existed yet for PS-APP-001, so no rebuild/re-test/back-out impact to record. Both docs committed and pushed.

### Ask the User — Batch 2 (Header fields, Cost visibility, Dashboard view)
4. Header-level fields for a new RFP/project? → **RFP/Project Name + Customer Name + Presales/Bid Manager owner field**
5. Who can see cost figures? → **Everyone who can see the RFP/project**
6. Primary dashboard view? → **By module (rows) x phase (columns)**

### Ask the User — Batch 3 (Visibility, validation, missing-rate handling)
7. Can a Presales/Bid Manager see other managers' RFPs? → **All RFPs/projects, org-wide**
8. Zero/negative effort or cost on a line? → **Zero allowed, negative blocked**
9. Missing rate in Cost Rate Master at calculation time? → **No block, keep cost blank, manual entry allowed** (no warning specified)

### Ask the User — Batch 4 (Rate dimension, Role list)
10. Cost Rate Master keyed by? → **Module + Role**
11. Role list for the Cost Rate Master? → **Configurable list** (admin-maintained, not a fixed set)

**AI:** All genuine gaps resolved. Design owner left as an assumption (same as Author). Proceeding to Freeze Confirmation.

**AI:** Presented Freeze Confirmation summary (✅/⚠️/❌ checklist). Asked "Ready to freeze this Functional Spec? (yes / edit a section)"

**User:** yes

**AI:** Generated and saved the full Functional Spec to `Artifacts/FunctionalSpec_PS-APP-001.md`.
