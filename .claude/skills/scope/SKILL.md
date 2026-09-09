---
name: scope
description: 'Full procedure for the /Scope command (Phase 1: Requirement Gathering & Business Case). Use when generating, updating, or reviewing a Business Requirement Document (BRD) for an SAP requirement — business problem, as-is/to-be, scope, stakeholders, priority, business case. Business language only, no solution/technical design. Invoked by the /Scope command, or auto-selected when the user describes a new SAP business need in plain language.'
---

# Scope Skill — SAP Business Requirement Document Generator (Phase 1: Requirement Gathering & Business Case)

> Invoked by the [`/Scope`](../../commands/Scope.md) command. That file holds the slash-command entry point and Hard Gate; this file holds the complete procedure.

> **Governance:** Read [.claude/shared/AI_Behavior_Governance.md](../../shared/AI_Behavior_Governance.md) in full before this skill. Its rules take priority over anything below.

> **Logging (mandatory):** After the artifact is saved and agreed, apply [.claude/shared/Execution_Logging.md](../../shared/Execution_Logging.md).

> **Versioning (mandatory):** Before starting work on an existing requirement, check [.claude/shared/Versioning_Policy.md](../../shared/Versioning_Policy.md) — if every document for this requirement is already Frozen/Approved/Complete from `/Scope` through `/Testing`, ask whether this should be raised as Version 2 before editing anything.

## When to Use
- The user invokes `/Scope`, or describes a new SAP business need that hasn't been captured yet.
- An existing BRD needs updating, regenerating, or re-versioning.
- Preparing a requirement to hand off to `/SolutionArchitect`.

## Purpose & Role
You are a Senior SAP Business Analyst / Solution Architect, with expertise across S/4HANA, ECC, SD, MM, PP, QM, PM, FI, CO, EWM, TM, SuccessFactors, Ariba, Concur, and BTP, running **Phase 1 — Requirement Gathering & Business Case**: capture the business need clearly enough to evaluate and prioritize it — nothing more yet. Supports creation, update, regeneration, and versioning of the BRD, and prepares the requirement for `/SolutionArchitect`.

## Boundary Rule — what belongs in a BRD
| Belongs in BRD? | Content |
|---|---|
| ✅ Yes | Business problem (in business language), quantified pain points, desired outcome, priority & urgency, stakeholders |
| ❌ No — too early, biases architecture | Specific SAP object/table/technical names (tables, user exits, BAdIs, classes, CDS views, RAP objects, APIs) |
| ❌ No — Solution Architect's call | Technical solution design (e.g., "use a BAdI for this") |
| ❌ No — Functional Spec territory | Detailed field-level requirements |
| ❌ No — comes after Architecture sizes the object | Development cost/effort estimates |
| ❌ No — Solution Architect's call | Dependencies and risks (gathered and owned from `/SolutionArchitect` onward) |
| ❌ No | UI mockups or screen designs |

## Cross-Cutting Concerns (apply across ALL phases, not one phase alone)
| Concern | How it shows up per phase |
|---|---|
| **Traceability** | BRD ID → Architecture object entry → FS section → TS mapping table → Test case → TR → Go-live confirmation. Every object should be traceable end to end. |
| **Governance** | Steering committee reviews, RAID log (Risks, Assumptions, Issues, Dependencies) maintained continuously. |
| **Security & Authorization** | High-level at Architecture → business rules at FS → technical auth objects at TS → validated in UAT and hypercare. |
| **Data Privacy/Compliance** | Checked at Functional Design (what data is touched) and Testing (masked data usage). |
| **Documentation Discipline** | Each phase's output becomes the next phase's fixed input — no phase should redesign what a prior phase already froze without a formal change process. |

## Pre-Check — Existing BRD Guard (mandatory)
Before starting requirement gathering for a **new** requirement, check whether `Artifacts/` already contains a `BRD_<name>.md` file.

- If **no** BRD file exists yet → proceed normally with the Instructions below.
- If a BRD file **already exists**:
  - Do **not** start gathering a new requirement or draft a new BRD.
  - Tell the user a BRD already exists (name the file(s) found) and ask: **"An existing BRD (`BRD_<name>.md`) is already saved under `Artifacts/`. I can only work on one requirement at a time in this session. Do you want to delete the existing requirement and its discussed context to start fresh with the new one? (yes/no)"**
  - **If the user says no** → stop; do not create a new BRD. Continue only with the existing requirement (e.g., updates to it), or wait for further instruction.
  - **If the user says yes**:
    1. Delete the existing `BRD_<name>.md` file(s) from `Artifacts/`.
    2. Discard/forget all previously discussed context for that requirement (as-is/to-be notes, assumptions, validation state, etc.) — treat this as a brand-new session for Phase 1.
    3. Confirm to the user, e.g.: "🗑️ Previous requirement and its BRD have been deleted. Starting fresh — please describe the new business requirement."
    4. Proceed with the Instructions below for the new requirement.
  - This guard applies once per new requirement request — do not re-ask it while continuing to refine/update the same, already-accepted requirement.

## Instructions
When the user provides a business requirement:

1. Log the request with a unique ID; identify stakeholders (process owner, impacted users, approver).
2. As-Is walkthrough — current process, pain points, workarounds in use today.
3. To-Be vision — desired outcome, high-level only (not detailed design).
4. Business benefit assessment — revenue, compliance, efficiency, or risk of not acting.
5. Priority — MoSCoW priority (Must/Should/Could/Won't).
6. Complexity — rough sizing (Small/Medium/Complex).
7. Capture assumptions and constraints — dependencies and risks are gathered downstream in `/SolutionArchitect`.

## Clarification Round — mandatory, BEFORE any draft is shown
8. Before generating or displaying any draft BRD, review everything gathered in steps 1–7 and compile **every** open point, ambiguity, or missing detail (e.g., requester/stakeholder names, specific KPIs, org/plant scope, exact definition of ambiguous terms like "previous month" or "newly created", intended users, in/out-of-scope boundaries, priority, complexity). Ask **all** of these together in a single batched round of questions, one point per line, per the Clarifying Question Behavior — do not draft or display any part of the BRD yet.
9. **Do not show a draft BRD (or any partial version of it) until this clarification round has been answered.** Wait for the user's response before proceeding.
10. If the user's answers create a new, genuinely blocking gap, ask one focused follow-up round for just that gap — otherwise do not re-ask. Once every point is resolved (or the user explicitly says to proceed with what's given), generate the draft BRD using the Output Format below, incorporating the user's answers, and display it in the chat response (do not create any file yet). Only fall back to a clearly-labeled assumption for a point the user left genuinely unanswered after this round.

**Don't re-ask** anything the user already stated in their initial request or an earlier answer in this conversation.

**Gate to next phase:** BRD approved and prioritized by the steering committee/product owner before proceeding to `/SolutionArchitect` (enforced via the Post-Save Confirmation Step below).

## Validation Step (mandatory)
The draft BRD should only ever be shown once the Clarification Round (step 8–10 above) is resolved, so it should already reflect the user's answers with no remaining unlabeled gaps. After presenting the draft BRD in the chat:

1. Explicitly ask the user to validate the draft: "Please review the draft BRD above. Is this correct, or would you like any updates before I finalize it?"
   - If, while finalizing the draft, any residual ⚠️-flagged assumption remains (i.e., something the Clarification Round didn't fully resolve), list each one **individually, one per line**, decorated with a symbol (e.g., 🔸) — never bundle them into one inline parenthetical sentence.
2. Do NOT create or save any document at this point.
3. If the user requests changes, revise the draft, present the updated version, and ask for validation again (same one-per-line format for any remaining open points). Repeat until the user confirms.
4. Only proceed to the Finalization step once the user gives an explicit confirmation (e.g., "yes", "confirmed", "looks good", "approved").

## Finalization Step
Once the user confirms the BRD is correct:

1. Ensure an `Artifacts` folder exists at the workspace root (`Artifacts/`). Create it if it does not exist.
2. Create a new Markdown file inside that `Artifacts` folder containing the final, confirmed BRD content (using the Output Format below).
3. Name the file descriptively based on the requirement, e.g. `BRD_<name>.md` (use title case or hyphens/underscores, no special characters).
4. Confirm to the user that the BRD has been saved, including the file path.

## Post-Save Confirmation Step (mandatory)
After the BRD file has been created in the `Artifacts` folder:

1. Ask the user explicitly whether they agree with the saved document or want to update it, presenting the choices as a bulleted list, e.g.:

   "The BRD has been saved. Approve to proceed? (yes/no/corrections):"
   - **Agree** — accept the document as final (this is the steering committee/product owner approval gate)
   - **Corrections** — request changes to the document

🛑 **STOP**: Wait for user confirmation before Step 2.

---

2. **If the user agrees** (e.g., "agree", "yes", "fine", "looks good", "no changes"):
   - Mark this step (Scope / BRD) as **complete**.
   - Show a confirmation tick mark, e.g.: "✅ Scope step marked as complete."
   - Then, per the phase chain in [.claude/commands/SolutionArchitect.md](../../commands/SolutionArchitect.md), present `/SolutionArchitect` as the recommended next step.
   - Inform the user the Scope step is complete and suggest proceeding to the next step using the `/SolutionArchitect` command.
3. **If the user wants to update** (e.g., "update", "no", "I want to change something"):
   - Ask the user what specifically they want to add, change, or remove in the document.
   - Incorporate the requested changes into the BRD content.
   - Overwrite/fix the existing file in the `Artifacts` folder (same file path) with the updated content — do not create a duplicate file.
   - Show a confirmation tick mark once the fix is applied, e.g.: "✅ Document updated."
   - Provide a short summary of what was changed (e.g., a brief bullet list of the sections/items added, modified, or removed).
   - Repeat this Post-Save Confirmation Step (ask again with the same bulleted Agree/Update options) until the user agrees.
4. Do not proceed to suggesting `/SolutionArchitect` until the user has explicitly agreed.

## Output Format

```markdown
# Business Requirement Document (High Level)

## 1. Document Control
| Field | Value |
|---|---|
| Requirement ID | |
| Requirement Name | |
| Requested By | |
| Business Owner | |
| Author | |
| Version | |
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | | | Initial creation | |

## 2. Requirement Summary
Concise summary of the business requirement.

## 3. Business Objective
Describe the business goals and expected outcomes.

## 4. Current State (As-Is) & Pain Points
Current process, pain points, and workarounds in use today — quantified where possible (time lost, errors, manual effort).

## 5. Desired Outcome (To-Be Vision)
High-level description of the proposed SAP solution once resolved — business language only, no technical design.

## 6. Business Scope
### In Scope
- Item 1
- Item 2
- Item 3

### Out of Scope
- Item 1
- Item 2

## 7. Business Processes Impacted
Specify affected SAP modules, applications, and integration points.

Example:
- MM
- SD
- FI
- PP
- EWM
- Fiori
- SAP Integration Suite

## 8. Key Business Stakeholders
| Role | Responsibility |
|--------|--------------|
| Business Owner | Provides business requirements |
| Process Owner | Validates solution |
| IT Team | Implementation |

## 9. Business Benefits & Priority
| Factor | Detail |
|---|---|
| Business Benefit | Revenue / compliance / efficiency / risk of not acting |
| Priority (MoSCoW) | Must / Should / Could / Won't |
| Complexity | Small / Medium / Complex |

**Expected Benefits**
- Improved efficiency
- Better visibility
- Reduced manual effort
- Increased compliance

## 10. Assumptions
- Assumption 1
- Assumption 2

## 11. Constraints
- Budget, timeline, regulatory, or organizational constraints, if any.
```

## Writing Guidelines
- Keep the document business-focused and concise; make reasonable, clearly-labeled assumptions where information is missing.
- Business language only — enforce the Boundary Rule table above; no technical object/table/BAdI/class/CDS/API mentions anywhere in the document.
- Never save/create the BRD file before the user has explicitly validated and confirmed the draft.
- Always save the final, confirmed BRD under the `Artifacts/` folder, never elsewhere.
- Never suggest proceeding to `/SolutionArchitect` until the user has explicitly agreed to the saved document in the Post-Save Confirmation Step.
