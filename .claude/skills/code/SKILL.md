---
name: code
description: 'Full procedure for the /Code command (Phase 5: Development/Build). Use when building and unit-testing the object(s) defined in a Technical Spec directly in the connected SAP system — object creation, coding checklist, transport request rules, unit/component testing, code review, static analysis, producing a Build & Unit Test Record. Invoked by the /Code command.'
---

# Code Skill — SAP Development (Build) Assistant (Phase 5: Development/Build)

> Invoked by the [`/Code`](../../commands/Code.md) command. That file holds the slash-command entry point and Hard Gate; this file holds the complete procedure.

> **Governance:** Read [.claude/shared/AI_Behavior_Governance.md](../../shared/AI_Behavior_Governance.md) in full before this skill. Its rules take priority over anything below.

> **Logging (mandatory):** After the artifact is saved and agreed, apply [.claude/shared/Execution_Logging.md](../../shared/Execution_Logging.md).

> **Versioning (mandatory):** Before starting work on an existing requirement, check [.claude/shared/Versioning_Policy.md](../../shared/Versioning_Policy.md) — if every document for this requirement is already Frozen/Approved/Complete from `/Scope` through `/Testing`, ask whether this should be raised as Version 2 before editing anything.

## When to Use
- The user invokes `/Code` for an Object ID (the requirement's frozen Requirement ID — see Object ID Rule below) with a frozen Technical Spec, or a prior `/Code` run is being resumed.
- Creating/activating SAP objects (`SAPWrite`/`SAPActivate`), running syntax/unit-test/ATC checks (`SAPDiagnose`), managing transport requests (`SAPTransport`), and deploying any Fiori/UI5 app the TS calls for.
- Producing the Build & Unit Test Record and continuing into `/Testing`.

**This is the execution phase.** You connect the tooling, build the objects, fix the bugs, deploy and smoke-test the app, and produce the record — yourself. You ask the user only for things that are genuinely theirs to provide or decide (see Autonomy Rules).

## Object ID Rule (framework-wide default)
The Object ID used to name this record (`Build_<ObjectID>.md`) is the same Requirement ID already used by the linked TS/FS — never a technical-style ID. If the TS covers multiple RICEFW components for this requirement, build and record all of them together in this **one** Build & Unit Test Record, under this **one** Object ID and the **same** single transport request(s) (per the Single Transport Request Rule below).

## Purpose
Build the actual object(s) **directly in the connected SAP system**, exactly per the frozen **Technical Specification** (`/TechnicalSpec`), using the available SAP development tools (`SAPWrite`/`SAPActivate` to create and activate objects, `SAPDiagnose` for syntax/unit-test/ATC checks, `SAPTransport` for transport requests, plus any deploy tooling — `npm`/`fiori deploy`, etc. — for UI apps). Track fidelity to the TS, coding standards, security practices, testing evidence, peer review, static analysis, and transport readiness — then produce a **Build & Unit Test Record**, and continue straight into `/Testing`.

**Gate to next phase:** Code review passed, unit tests passed, and the transport request is ready for QA import (Section 10) — then `/Testing` is entered automatically (see Step 11).

## Autonomy Rules for this phase (mandatory)
`/Code` is the execution phase — drive it, don't narrate blockers back to the user unless a decision is genuinely theirs.

1. **Own the connectivity.** At phase start (Step 0), identify every MCP server / tool the build and deployment need (SAP ADT MCP, any Fiori/BTP/Git server, local `npm`/CLI). Probe each one yourself. If a server is "connecting", wait and re-probe; if it dropped, retry a few times across the phase; use a working alternative path where one exists (e.g. if the SAP ADT MCP is down but HTTP + credentials work, deploy a UI app via `fiori deploy`; read metadata over HTTP). Do not stop at "the MCP is not connected" — exhaust the options first.
2. **Resolve issues yourself.** Activation errors, syntax errors, failed unit tests, annotation/manifest mistakes, wrong client, missing facets, deploy misconfig — diagnose and fix them in your own tool calls and re-run, iterating until clean. Do **not** hand a fixable bug back to the user.
3. **Manual dependencies → brief bullets → auto-retry.** Some things only the user/Basis/Security can do (supply SAP credentials, unlock a user, create an SU21 auth object or PFCG role, flip a client setting, authorise an MCP server via OAuth, publish a service in a restricted client). When you hit one, stop and give a **short bullet list** of exactly what the user must do — no long explanation. As soon as they say it's done, **retry the step yourself** and carry on. Track each as an Issues Log row.
4. **Genuine escalations only.** Reserve questions for: an approval gate this skill defines (the Step 6 implementation-plan go-ahead, the Step 8 freeze confirmation), a real FS/TS design conflict (per Issue & Change Escalation), or a decision with business/scope impact. Everything else you do yourself.
5. **Finish the phase.** When the Build & Unit Test Record is saved and its gate is met, invoke `/Testing` directly — do not end the turn asking the user to run the next command.

## Boundary Rule (mirrors the TS boundary, from the other side)
This command **executes** the design frozen in TS — it does not redesign it. If the build reveals the TS design is wrong, incomplete, or can't be implemented as specified, **flag it back to TS rather than silently deviating**.

| Comes from TS (don't redesign) | Owned here (build/verify) |
|---|---|
| Object type, build approach (BAdI/enhancement/user-exit/custom program), data model | Actual object creation in SAP exactly per the TS design |
| Program/processing logic design, FS-rule-to-technical mapping | Writing the code implementing that logic; inline documentation/comments |
| Error handling, authorization, performance design | Coding standards, secure coding practices (authorization checks, input validation, no hardcoded credentials, safe dynamic SQL) |
| Unit test design (test cases, mock/test data approach) | Executing unit tests and documenting results; self-testing against FS's UAT scenarios |
| — | Code review, static code analysis (ATC/Code Inspector), transport finalization |

**No new business logic:** anything not traceable to FS/TS must be flagged and clarified there first — never invented on the fly (see Issue & Change Escalation below). Never test in Production or an uncontrolled client.

## Single Transport Request Rule (mandatory)
All objects built for this Object ID go into **exactly one Workbench request** — no more. If configuration/customizing changes are also required, they go into **exactly one Customizing request** — no more. Never create a second request of either kind for the same build.

- Before creating anything, check for an existing open request for this Object ID (`SAPTransport` `list`/`get`). If one exists, **reuse it** — pass its number as `transport` on every subsequent `SAPWrite`/`SAPManage` call.
- If none exists, create exactly one Workbench request (`SAPTransport` `create` — this always creates a Workbench (K) request) and, only if the TS/config review calls for customizing changes, exactly one Customizing request.
- Every development object (programs, classes, CDS views, BAdI implementations, etc.) for this build uses the **same** Workbench request number. Every customizing/config change uses the **same** Customizing request number.
- If a second request of either kind is about to be created, stop and ask the user instead — do not silently create it.

## Issue & Change Escalation (mandatory when specs must change)
If coding surfaces an unforeseen issue requiring a change to the FS or TS, don't decide it alone:

1. Review the issue and proposed change with the **technical designer**, **onsite development coordinator**, and **development lead**.
2. The onsite development coordinator loops in the **functional designer** where the change affects functional behavior.
3. This review establishes: what changes should be made, when they'll be implemented, the schedule impact, and any budget impact.
4. Log the issue, decision, and these four points in the Issues Log (Section 12 of the Build & Unit Test Record) before proceeding.

## Cross-Cutting Concerns (apply across ALL phases, not one phase alone)
| Concern | How it shows up per phase |
|---|---|
| **Traceability** | BRD ID → Architecture object entry → FS section → TS mapping table → Test case → TR → Go-live confirmation. Every object should be traceable end to end. |
| **Governance** | Steering committee reviews, RAID log (Risks, Assumptions, Issues, Dependencies) maintained continuously. |
| **Security & Authorization** | High-level at Architecture → business rules at FS → technical auth objects at TS → validated in UAT and hypercare. |
| **Data Privacy/Compliance** | Checked at Functional Design (what data is touched) and Testing (masked data usage). |
| **Documentation Discipline** | Each phase's output becomes the next phase's fixed input — no phase should redesign what a prior phase already froze without a formal change process. |

## Workflow
0. **Environment & Connectivity Setup** — identify and connect every MCP server / tool the build + deploy need; resolve or list manual blockers.
1. **Entry Criteria & Transport Request Setup** — confirm TS readiness and set up the single Workbench (+ Customizing, if needed) request.
2. **Source Discovery** — locate the Technical Spec (and Functional Spec if needed).
3. **Context Pull** — extract the build reference details; no questions yet.
4. **Gather Only What's Missing** — pull everything from TS/FS/conversation; ask the user only for what you genuinely cannot obtain or derive yourself.
5. **Present Implementation Plan** — consolidate Steps 1–4 into a single, ordered plan and get explicit go-ahead **before** touching SAP.
6. **Build in SAP** — create/activate each object via `SAPWrite`/`SAPActivate` (and deploy any UI app), all under the single transport request(s); fix every bug yourself and re-run until clean.
7. **Deploy & smoke-test UI apps** (if the TS includes a Fiori/UI5 app) — build, deploy to the connected system, verify it loads and the key screens render; fix defects yourself.
8. **Freeze Confirmation** — summarize and get explicit sign-off.
9. **Generate the Build & Unit Test Record** — using the fixed template.
10. **Save to Artifacts** — persist the record.
11. **Continue to `/Testing`** — invoke the next phase automatically.

## 0. Environment & Connectivity Setup (do this first, before anything else)
1. **List what the build needs.** From the TS's object inventory work out every capability required: the SAP ADT MCP (CDS/ABAP/DDIC/transport/ATC/unit test), a Fiori/UI5 deploy path (`npm` + `@sap/ux-ui5-tooling` / `fiori deploy`, or BAS), and anything else the TS implies (BTP, Git, gateway).
2. **Probe each one.** Call the MCP server's cheapest read (`SAPRead type=SYSTEM`, `SAPManage action=features`) to confirm it answers. For local tooling, check `node`/`npm` and the project's `package.json`.
3. **If a server isn't answering:**
   - "still connecting" → wait briefly and re-probe (a few times across the phase).
   - dropped mid-phase → retry on the next step that needs it; keep going on steps that don't.
   - not configured / needs OAuth / needs `claude mcp` → this is a manual dependency (see 5).
   - Where the MCP is unavailable but the goal is still reachable another way (HTTP + basic auth for reads/deploys, `fiori deploy` for a BSP), **use that path** and note it in the Build record.
4. **Discover connection facts yourself** before asking: SAP host/port from `SAPUILandscape.xml`; client from the requirement's TS/`execution/{req-id}/` notes or by testing which client authenticates; package/software-component from existing `Z*` packages. Only ask the user for a fact that genuinely can't be found or tested.
5. **Manual dependencies — brief bullets, then auto-retry.** If something truly needs the user (SAP credentials, unlock a locked user, authorise an MCP server, Basis client setting, SU21/PFCG object, publish in a restricted client), post a short list:
   > **Need from you before I can continue:**
   > - …
   > - …
   Then wait. The moment the user says it's done, **re-run the blocked step yourself** and continue — do not make them re-invoke `/Code`. Log each as an Issues Log row (Section 12).

## 1. Entry Criteria & Transport Request Setup
Confirm before build begins — do not silently assume:

- ☐ The TS has been reviewed and is frozen/saved, with no outstanding technical assumptions flagged for live-system verification.
- ☐ DEV client and package are confirmed.
- ☐ **Transport request(s) resolved** per the Single Transport Request Rule above.

If the TS isn't ready, flag it back to the user and recommend resolving it in `/TechnicalSpec` or with the Basis/transport team first.

## 2. Source Discovery
- Look in `Artifacts/` for the linked Technical Spec (`TechnicalSpec_<ObjectID>.md`) and, if needed, the Functional Spec (`FunctionalSpec_<ObjectID>.md`) for UAT scenarios.
- Multiple `TechnicalSpec_<ObjectID>.md` files found → ask which requirement (Requirement ID) this build is for. Per the Object ID Rule above, there is no separate per-RICEFW-row Object ID to ask about once the requirement/TS is identified.
- **None found → Backward Dependency Check:** do not just tell the user to go run `/TechnicalSpec` manually. Instead: (1) tell the user the Technical Spec is missing and that you're switching to `/TechnicalSpec` now to generate it; (2) run the full `/TechnicalSpec` flow inline (which itself will cascade back to `/FunctionalSpec`/`/SolutionArchitect`/`/Scope` if those are also missing) until the TS is saved; (3) once confirmed, automatically resume this `/Code` flow from this step using the newly created TS — the user does not need to re-invoke the command.

## 3. Context Pull (no questions yet)
Before asking the user anything:

1. From the linked Technical Spec, extract: Object ID, Object Name, build approach, data model, program definitions, FS-rule-to-technical mapping, unit test design (Section 12), and component test plan (Section 12a).
2. From the linked Functional Spec, extract the UAT test scenarios (Section 11) for the self-test step.
3. Pre-fill every field that can be reasonably derived. Only ask the user about genuine build/execution details still open.
4. Check `SAPTransport` (`list`, filtered to modifiable requests) for any request already associated with this Object ID, so Step 1's transport resolution doesn't create a duplicate.

## 4. Gather Only What's Missing (you do the build, not the user)
This phase's build/test/deploy steps (B–H below) are things **you perform with your own tools** — object creation, unit tests, ATC, self-test, deploy. Do not ask the user to run them and report back. Work through them in Steps 5–7 and record the real results you obtained.

**Don't re-ask / don't ask at all:** skip anything already in Context Pull (Step 3), the TS/FS, `execution/{req-id}/` notes, or the conversation. Derive connection facts per Step 0.4. The only things worth a question:
- **A. Environment facts you genuinely can't find or test** — e.g. the DEV client if it isn't in the TS/notes and multiple clients authenticate; the package/software-component only if no pattern exists. Try to determine these yourself first.
- **A2. Manual dependencies** — per Step 0.5, as brief bullets, then auto-retry.
- **F. Peer code review** — reviewer name + findings, since a second person's review is external to you. Do your own review pass regardless and record it; note the peer reviewer as pending if not yet done.
- A real **FS/TS design conflict** — via Issue & Change Escalation.

Everything else (B object creation, C coding checklist, D unit testing, E self-test vs FS scenarios, G ATC, H transport finalization) you execute and document yourself.

**Self-check:** if a build detail requires new business logic not traceable to FS/TS, stop and flag it:

> "That logic isn't defined in the FS or TS. Recommend clarifying it there first via `/FunctionalSpec` or `/TechnicalSpec` before building it."

## 5. Present Implementation Plan (single plan, before touching SAP)
Before any `SAPWrite`/`SAPActivate` call is made, consolidate everything from Steps 0–4 into **one single, ordered implementation plan** — never a scattered series of partial plans, and never split across multiple messages. This is the last checkpoint before live SAP changes (read-only Step 0 probing doesn't need approval), so it must be complete and unambiguous. Include a row for any Fiori/UI5 app deploy (Step 7) and a short "Manual dependencies outstanding" list if any:

```markdown
### Implementation Plan — [Object ID – Object Name]

**1. Transport Request(s)**
| Type | Number | Reused or New |
|---|---|---|
| Workbench | | |
| Customizing (if applicable) | | |

**2. Build Order** (respects dependencies, e.g. TABL → DDLS → DCLS → BDEF)
| Seq | Object Type | Object Name | Build Approach (from TS) | Depends On |
|---|---|---|---|---|

**3. Verification Steps per Object**
Syntax check → Activate → Unit test → ATC, for each object in the order above.

**4. Config/Customizing Changes** (if any, under the single Customizing request only)

**5. Open Items Carried Forward**
> Anything from Step 4 still ⚠️/❌ that the user chose to proceed with anyway.
```

Ask: **"Proceed with this implementation plan exactly as shown? (yes / edit a line)"** Do not begin Step 6 until the user confirms. If the user edits, update the single plan in place and re-confirm — do not generate a second, competing plan alongside it.

## 6. Build in SAP
With the implementation plan approved (Step 5), create the objects directly in the connected SAP system, in the exact order and under the exact transport request(s) shown in that plan:

1. For each object, use `SAPWrite` (`create`, or `batch_create` for interdependent stacks such as TABL→DDLS→DCLS→BDEF) with `transport` set per the Single Transport Request Rule. Apply the **Coding Checklist** below while writing each object's logic.
2. Run `SAPDiagnose` (`syntax`) before activation; fix any errors and re-check.
3. Activate each object with `SAPActivate` (batch-activate when there are 2+ objects or an interdependent RAP stack).
4. For any customizing/config change identified in the TS's config review, make it under the single Customizing request only.
5. Run `SAPDiagnose` (`unittest`) to execute the TS's unit test design, and `SAPDiagnose` (`atc`) for static code analysis; capture results for the Build & Unit Test Record.
6. **Proofread and debug** each program until reaching a high degree of confidence it works per the TS — passing static checks alone is not sufficient.
7. **Update the Component Test Plan** (TS Section 12a) with any new conditions/changes surfaced during coding. Test data should be provided by the functional team member. Finalize the plan and outline each cycle's steps (test data used, selection-screen parameter values), and ensure expected vs. actual results are documented.

### Fix your own bugs (mandatory)
Activation errors, syntax errors, failing unit tests, ATC findings, wrong field/table/view names, annotation or manifest mistakes, wrong client, join/aggregation errors — **diagnose and fix these yourself**, re-write, re-activate, re-test, and iterate until the object is clean. Read the error, inspect the released object/field it complains about (`SAPRead`, `SAPContext`, `SAPSearch`), correct the source, repeat. Do not report a fixable build bug to the user or defer it — only a genuine FS/TS design conflict (something the spec says that cannot be implemented, not merely a coding mistake) goes back via Issue & Change Escalation, and only a true manual dependency (Step 0.5) is handed out as bullets. Record notable bugs and their fixes in the Issues Log.

If an object genuinely can't be created/activated **as the TS designs it** (not a coding slip — an actual design impossibility), flag it back to `/TechnicalSpec`. If the issue requires changing the FS/TS itself, follow the Issue & Change Escalation process above.

## 7. Deploy & Smoke-Test UI Apps (only if the TS includes a Fiori/UI5 app)
If the TS's object inventory has a Fiori Elements / UI5 / BSP app:

1. Generate/assemble the app source (manifest, Component, annotations, i18n, deploy config) consistent with the CDS annotations already built. Fill the deploy target from Step 0.4 (host, client, package, the single transport request).
2. Build it (`npm run build` / `ui5 build`) and deploy it to the connected system (`fiori deploy`, or the SAP ADT MCP UI5-repo path if available). Supply credentials via `.env` when the user has provided them (Step 0.5).
3. **Verify it loads**: fetch the deployed `manifest.json` / `Component-preload.js` / annotation files and confirm 200 + expected content; run the OData queries the List Report / Object Page fire and confirm they return; check read-only capability restrictions if the app is display-only.
4. **Fix UI defects yourself** — blank page (bootstrap/`ComponentSupport`, routing config), blank Object Page (missing `UI.Facets` — add via CDS metadata extension, or an app-local `annotation.xml` if the CDS can't be touched right now), over-restrictive mandatory filters, buttons that contradict the FS (e.g. Delete on a read-only app) — correct and redeploy until the app matches the FS.
5. Where a visual check isn't possible from here, verify structurally (annotations present, queries succeed) and tell the user the exact URL to open for a final visual confirmation.
6. Record the deployed app, its URL, and every fix in Sections 3 / 9 / 12 of the Build record. FLP catalog/tile/target-mapping: create via the SAP MCP where available, otherwise list as a brief manual step.

### Coding Checklist (apply to every object)
- Naming conventions, modularization, and performance best practices (avoid nested SELECTs, use proper JOINs, avoid `SELECT *`)
- Secure coding — authorization checks, input validation, no hardcoded credentials, dynamic SQL handled safely
- Basic error handling, messages, and audit trail
- Missing or empty input/output files, directories, and variants
- Calculation field overflows and errors (e.g. dividing by zero)
- Input field formatting (search helps, value lists, numeric vs. alpha errors)
- Output field formatting (layout accuracy, decodes, pagination, headers/footers, tabs, currency, decimals)
- Selection criteria completeness (WHERE clause covers all cases)
- Calculation correctness (summation and grouping)
- Time/date/user stamps complete
- Printing and downloading, if specified
- Sufficient inline comments per team standard

## 8. Freeze Confirmation (before generating final record)
Summarize with clear status indicators before generating the final document. Every ✅ must reflect work **you actually did and verified**, not something delegated:

```
✅  Entry criteria & transport request(s)  — confirmed (1 Workbench, 1 Customizing)
✅  Objects built (matches TS)             — confirmed, no deviations
✅  Coding checklist & security compliance — confirmed
✅  Proofread/debug (high confidence)      — confirmed
✅  Unit tests executed                    — confirmed, all passed
⚠️  Self-test vs FS scenarios              — 1 scenario pending
✅  Component Test Plan finalized          — confirmed
✅  Code review                            — confirmed, no open findings
❌  Static code analysis (ATC)             — not yet run
❌  Transport finalized                    — not yet released
```

- ✅ Green check = confirmed, ready to freeze
- ⚠️ Yellow = partially answered, will proceed with a stated assumption unless corrected
- ❌ Red = missing, must be answered before freeze if it's a core section (Transport Request(s), Object Creation, Unit Testing, Code Review, or Static Code Analysis)

Ask: **"Ready to finalize this Build & Unit Test Record? (yes / edit a section)"**
Do not generate the final document until confirmed, unless the user explicitly says to proceed with assumptions.

## 9. Generate the Build & Unit Test Record

```markdown
# Build & Unit Test Record

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | (the requirement's Requirement ID — see Object ID Rule above; never a technical-style ID) |
| Object Name | |
| Linked Technical Spec Ref | |
| Linked Functional Spec Ref | |
| Developer | |
| Version | |
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | | | Initial creation | |

## 2. Development Environment & Transport
| Item | Value |
|---|---|
| DEV Client | |
| Package | |
| Workbench Request (single) | |
| Customizing Request (single, if applicable) | |

## 3. Objects Built
| Object Type | Object Name | Status | Deviation from TS? |
|---|---|---|---|

## 4. Coding Standards & Security Compliance
| Check | Status | Notes |
|---|---|---|
| Naming conventions & modularization | | |
| Performance best practices (no nested SELECTs, proper JOINs, no `SELECT *`) | | |
| Authorization checks & input validation | | |
| No hardcoded credentials; dynamic SQL handled safely | | |
| Inline documentation/comments per team standard | | |

## 5. Unit Test Results
| # | Test Case (from TS Section 12) | Method/Class | Result | Evidence |
|---|---|---|---|---|

## 6. Self-Test Against FS Scenarios
| FS Scenario Ref (Section 11) | Result |
|---|---|

## 7. Code Review
| Reviewer | Findings | Resolution | Status |
|---|---|---|---|

## 8. Static Code Analysis
| Tool | Result | Exceptions Documented |
|---|---|---|
| Code Inspector / ATC | | |

## 9. Component Test Plan (Finalized)
> Updated from TS Section 12a with any new conditions/changes surfaced during coding. Test data provided by the functional team member.

| # | Acceptance Test Criteria | Test Data / Selection Parameters | Expected Result | Actual Result |
|---|---|---|---|---|

## 10. Transport Finalization
| Transport Request | Type (Workbench/Customizing) | Contents | Released Date | Ready for QA? |
|---|---|---|---|---|

## 11. Assumptions & Dependencies

## 12. Issues Log
> Includes any spec changes raised during coding, per the Issue & Change Escalation process.

| Issue ID | Description | Resolution | Schedule Impact | Budget Impact | Status |
|---|---|---|---|---|---|

## 13. Sign-off
| Role | Name | Status |
|---|---|---|
| Developer | | ✅ Approved |
| Peer Reviewer | | ⬜ Pending |
| Technical Lead | | ⬜ Pending |

---
**Next step:** `/Testing` for Object ID: ___, using this Build & Unit Test Record and the linked TS/FS as reference.
```

## 10. Save to Artifacts
- Ensure the `Artifacts/` folder exists; create it if missing.
- Save the record as `Build_<ObjectID>.md`, where `<ObjectID>` is the requirement's Requirement ID (per the Object ID Rule above) — in `Artifacts/`.
- Confirm the saved file path to the user.
- Apply [.claude/shared/Execution_Logging.md](../../shared/Execution_Logging.md) now (silent).
- If the user later requests edits, apply them, overwrite the same file (no duplicates), and briefly summarize what changed.

## 11. Continue to `/Testing` (automatic)
Once the Build & Unit Test Record is saved and its gate is met (code review pass — your own review at minimum, unit tests pass, transport ready), **invoke `/Testing` yourself** for this Object ID — do not stop and wait for the user to type the command. Post a one-line handoff, then enter the phase:

> ✅ **Build & Unit Test Record complete for [Object ID – Object Name]** — transport ready for QA import. Continuing to `/Testing`.

Only pause here instead of continuing if the gate is genuinely not met (a core section still ❌ that needs a real user decision or an unresolved manual dependency) — in which case state precisely what's outstanding, as brief bullets, and resume into `/Testing` as soon as it's cleared.

## Guardrails Summary

| Do | Don't |
|---|---|
| Connect every needed MCP server / tool yourself at Step 0; use HTTP/CLI fallback paths when an MCP is down | Stop at "the MCP is not connected" without trying alternatives |
| Discover host / client / package / transport yourself (landscape file, `execution/{req-id}/` notes, auth testing) | Ask the user for a connection fact you could find or test |
| Fix syntax/activation/unit-test/ATC/manifest/annotation bugs in your own tool calls and re-run until clean | Hand a fixable build bug back to the user, or defer it |
| Deploy the Fiori app, verify it loads, fix UI defects (blank page, missing facets, wrong buttons), redeploy | Deliver an app you never deployed or checked |
| List a genuine manual dependency as a few bullets, then retry the step yourself once done | Make the user re-invoke `/Code`, or write a long explanation of the blocker |
| Keep the Step 6 implementation-plan go-ahead and the Step 8 freeze confirmation gates | Skip the plan approval before first touching SAP |
| Build exactly per the frozen TS; put real logic-design conflicts through Issue & Change Escalation | Redesign the TS, or invent business logic not traceable to FS/TS |
| All objects for the Object ID under one Workbench (+ one Customizing) request | Create a second request of either kind |
| Record every bug, fix, deviation and manual step in the Build record's Issues Log | Present a ✅ for work you delegated rather than performed |
| Invoke `/Testing` automatically once the Build record is saved and its gate is met | End the turn telling the user to run `/Testing` themselves |
