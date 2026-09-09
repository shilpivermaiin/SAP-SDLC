---
description: Reusable logging component for recording execution details, governance information, quality metrics, traceability updates, and audit records after every SAP-SDLC phase execution.
---

> **Priority: Mandatory.** Applies to every phase (`/Scope`, `/SolutionArchitect`, `/FunctionalSpec`, `/TechnicalSpec`, `/Code`, `/Testing`).

# Workflow Execution Logging Pattern

## Purpose

This pattern provides a reusable logging framework for all SAP-SDLC phases (`/Scope`, `/SolutionArchitect`, `/FunctionalSpec`, `/TechnicalSpec`, `/Code`, `/Testing`).

The objective is to ensure:

- Full auditability
- Requirement traceability
- Usage analytics
- Artifact tracking
- Quality measurement
- Governance compliance
- Change history preservation

Every phase execution must generate a structured audit record, **in addition to** — never instead of — the phase's actual Markdown artifact in `Artifacts/`. This log is a metadata trail, not a substitute for the Output Format template defined in the phase's `SKILL.md`.

---

## Use In Phases

Reference this pattern at the end of every phase execution, after the artifact has been saved and agreed per the phase's own Post-Save Confirmation step.

Execution sequence:

```text
Input Validation
        ↓
Skill + Governance Loading
        ↓
Artifact Generation
        ↓
Quality Validation
        ↓
Traceability Update
        ↓
Execution Logging
        ↓
Phase Complete
```

---

> If you cannot locate or write this file:
>
> - Do NOT search for alternative files
> - Do NOT use unrelated markdown files
> - Skip the logging step completely
> - Continue phase execution
> - Never fail or block phase execution because logging is unavailable

---

# When To Use

Apply at the end of every phase execution:

```text
Scope
SolutionArchitect
FunctionalSpec
TechnicalSpec
Code
Testing
```

Logging is mandatory whenever a phase produces or updates a Frozen artifact. It does not apply to pure Q&A/clarification turns that produce no artifact change.

---

# Log File Location

Relative to the workspace root:

```text
.sapsdlc/logs/<userId>/<yyyy-mm-dd>.json
```

Example:

```text
.sapsdlc/logs/shilpi.verma@company.com/2026-08-18.json
```

Rules:

- One file per day, per user
- JSON only
- Never use md/txt/csv
- Append only
- Preserve history
- This folder is local, per-user audit data — it must stay out of version control (see `.gitignore`), never committed alongside `Artifacts/`

---

# Pattern Steps

## Step 1: Read Configuration

Read directly:

```text
.sapsdlc/sapsdlc.conf
```

Do NOT perform searches. The file may be gitignored and may not exist yet.

---

### Example Configuration

```yaml
userId: alice@example.com
projectId: SD-100
projectName: France eInvoice
environment: DEV
```

---

### Extraction Rules

Extract:

```yaml
userId:
```

Examples:

```yaml
userId: alice@example.com
```

Result:

```text
alice@example.com
```

Examples:

```yaml
userId: "alice@example.com"
```

Result:

```text
alice@example.com
```

If missing:

```text
unknown
```

Never stop execution due to missing config.

---

## Step 2: Determine Quality Scores

### quality.inputContext

Measures completeness of inputs.

| Score | Description |
|---------|---------|
| 5 | Complete BRD/Architecture/FS/TS and detailed context |
| 4 | Minor information gaps |
| 3 | Moderate assumptions required |
| 2 | Significant missing information |
| 1 | Minimal context provided |

---

### quality.reviewComments

Measures quality of review comments.

| Score | Description |
|---------|---------|
| 5 | Detailed and actionable comments |
| 4 | Mostly clear comments |
| 3 | Partial comments |
| 2 | Minimal feedback |
| 1 | No useful feedback |
| null | No review step occurred |

---

### quality.questionResponse

Measures quality of user clarifications (see the Clarifying Question Behavior in `CLAUDE.md`).

| Score | Description |
|---------|---------|
| 5 | Complete answers provided |
| 4 | Mostly complete |
| 3 | Some ambiguity remains |
| 2 | Minimal answers |
| 1 | No meaningful response |
| null | No questions were asked |

---

### quality.artifactCompleteness

Measures generated deliverable quality against the phase's Output Format template and Freeze Confirmation (✅/⚠️/❌).

| Score | Description |
|---------|---------|
| 5 | All sections generated, all ✅ |
| 4 | Minor omissions, isolated ⚠️ |
| 3 | Several incomplete sections |
| 2 | Significant missing content |
| 1 | Partial document only |

---

## Step 3: Determine Phase Mode

| Mode | Usage |
|---------|---------|
| CREATE | New artifact creation |
| UPDATE | Existing artifact update |
| VALIDATE | Freeze/quality gate validation |
| REVIEW | Review activity (e.g. `/Code` component review, `/Testing` defect review) |
| COMPOSITE | A run spanning multiple phases in one turn |
| UTILITY | Setup/help/reporting, no artifact produced |

Examples:

```text
CREATE     → BRD generation
UPDATE     → FS revision
REVIEW     → Code review
VALIDATE   → TS Freeze Confirmation
COMPOSITE  → Scope through Code run in one session
UTILITY    → Status/statistics request
```

---

## Step 4: Determine Output Status

### COMPLETE

Use when the phase's primary artifact was successfully generated and saved, matching the Workflow Completion Rule in [AI_Behavior_Governance.md](AI_Behavior_Governance.md).

Examples:

```text
BRD generated
Solution Architect write-up generated
FS generated
TS generated
Build & Unit Test Record generated
Test Document section generated
```

---

### PARTIAL

Use when:

```text
Mandatory sections missing
Insufficient source input
Incomplete output
Hard Gate blocked progression
```

---

# Step 5: Traceability Update

Every phase must maintain requirement traceability, matching Principle 8 (Traceability) in [AI_Behavior_Governance.md](AI_Behavior_Governance.md).

Structure:

```text
Requirement
 ↓
Scope (BRD)
 ↓
Solution Design (Solution Architect write-up)
 ↓
Functional Specification
 ↓
Technical Specification
 ↓
Code (Build & Unit Test Record)
 ↓
Testing (Test Document)
```

Example, using this repo's Requirement ID pattern (`{MODULE}-{TYPE}-{NNN}`, see `config/naming-standards.json`) and artifact naming convention:

```json
{
  "requirementId": "SALES-RPT-001",
  "scopeArtifact": "BRD_SalesOrderPreviousMonth.md",
  "solutionArtifact": "SolutionArchitect_SalesOrderPreviousMonth.md",
  "functionalSpecArtifact": "FunctionalSpec_ZSD_SALESRPT.md",
  "technicalSpecArtifact": "TechnicalSpec_ZSD_SALESRPT.md",
  "buildArtifact": "Build_ZSD_SALESRPT.md",
  "testArtifact": "Test_Document.md"
}
```

---

## Step 6: Capture Behavioural Notes

Record notable observations.

Examples:

```json
[
  "User provided detailed business context upfront",
  "User skipped review cycle",
  "User requested architectural redesign",
  "User requested rapid prototype generation",
  "User provided rich review comments",
  "User modified scope during execution",
  "User asked follow-up questions after generation"
]
```

Use:

```json
[]
```

if nothing notable occurred.

---

## Step 7: Generate Timestamp

Use the actual UTC timestamp.

Example:

```text
2026-08-18T15:42:17Z
```

Requirements:

- Real timestamp
- UTC timezone
- Include HH:MM:SS

Never use:

```text
00:00:00Z
```

unless it is the real time.

---

## Step 8: Build Log Entry

Example:

```json
{
  "timestamp": "2026-08-18T15:42:17Z",
  "phase": "TechnicalSpec",
  "mode": "CREATE",
  "outputStatus": "COMPLETE",
  "projectId": "SD-100",
  "artifactId": "TechnicalSpec_ZSD_SALESRPT.md",
  "requirementId": "SALES-RPT-001",
  "quality": {
    "inputContext": 5,
    "reviewComments": null,
    "questionResponse": null,
    "artifactCompleteness": 5
  },
  "behaviouralNotes": [
    "User supplied an approved Functional Specification"
  ]
}
```

---

## Step 9: Append To Log File

Determine filepath:

```text
.sapsdlc/logs/<userId>/<yyyy-mm-dd>.json
```

Create the directory if missing:

```text
.sapsdlc/logs/<userId>/
```

If the file exists:

```text
Read JSON array
Append entry
Write file
```

If the file does not exist:

```text
Create []
Append record
Save JSON
```

If the existing file cannot be parsed as a JSON array (corrupted): do not crash or block the phase — start a new array containing only the current entry, and add a behavioural note flagging that prior history could not be read.

---

### Important Rules

Always append.

Correct:

```json
[
  {...},
  {...},
  {...}
]
```

Incorrect:

```json
{
  ...
}
```

Never overwrite historical entries. Never log actual business data, credentials, or sensitive field values — this is a metadata/audit trail, not a data export.

---

## Step 10: Silent Confirmation

Logging is an internal governance operation.

Do NOT display:

- JSON payload
- Audit entry
- Quality scores
- Behaviour tracking

unless explicitly requested by the user.

---

# SAP-SDLC Governance Metrics

Each log entry contributes to:

## Usage Analytics

Track:

- Most used phase
- Most generated artifact type
- Most impacted SAP module

---

## Quality Analytics

Track:

- Average document quality
- Average completeness score
- Rework requests

---

## Delivery Analytics

Track:

```text
BRD Created
Solution Architect write-ups Created
FS Created
TS Created
Code Generated
Testing Generated
```

---

## Compliance Analytics

Track:

- Security reviews performed
- Clean Core assessments performed
- Testing coverage generated
- Quality gate pass rate

---

# Supplementary Records

## Clarification Records (Full Phase Transcript)

`execution/{req-id}/{skill-name}.clarifications.md` is not just a Q&A summary — it is the running, append-only, verbatim transcript of this phase, for this requirement, from the moment the phase starts until it is frozen. Append to it after every turn in the phase, not just at the end:
- A `Profile:` tag at the top (see Per-Phase Profile Tagging below) — which persona profile was active when these questions were asked
- Every user message, verbatim, in order (questions answered, choices made, instructions given, corrections)
- Every corresponding AI response, verbatim, in order (questions asked, options presented, artifact excerpts, confirmations)
- Any assumption the skill made and how it was resolved (confirmed / overridden / left flagged)

This file is requirement-scoped (lives under `execution/{req-id}/`), never inside `.claude/skills/<skill-name>/` — the skills folder holds the static procedure every requirement reuses, not a specific requirement's runtime history. Keeping it under `execution/{req-id}/` is what lets the same phase be picked up mid-way, by a different person, without mixing history from an unrelated requirement.

This log is audit/reference material only — per Onboarding's own flow, it is not auto-summarized back to a new person joining mid-phase (see `.claude/skills/onboarding/SKILL.md`); only the `Profile:` tag is loaded automatically. A person picking up mid-phase, or the AI itself if asked "what happened so far", can read this file directly for full context.

Add a one-line entry to `knowledge/clarification-index.md` (or your equivalent index) pointing to the new record.

## Per-Phase Profile Tagging

Each phase's clarification record starts with:
```markdown
Profile: FUNCTIONAL
Role stated: Functional Consultant
Date: 2026-08-22
---
```
This is set once per `{req-id} + phase}` combination by the onboarding check (see `.claude/skills/onboarding/SKILL.md`) — not once per project, not once per session. Different people typically own different phases (e.g., a Business Analyst scopes it, an Architect designs it, a Functional Consultant specs it, days or weeks apart) — each phase gets its own tag, independent of the others.

Append one row per phase to `execution/{req-id}/profile-history.md`:
```markdown
| Phase | Profile | Role Stated | Date |
|---|---|---|---|
| scope | BUSINESS_SEMI_TECHNICAL | Business Analyst | 2026-08-15 |
| solution-architect | ARCHITECT | Solution Architect | 2026-08-19 |
```

## Build/Test/Deploy Logs
- `code` writes/updates `execution/{req-id}/build-log.md`
- `testing` writes/updates `execution/{req-id}/test-log.md` and `execution/{req-id}/defect-log.md`

## Why This Matters
Lets a future run, a new team member, or an auditor understand *why* a spec says what it says and *who (role-wise)* answered the questions that shaped it — without re-interviewing the business or reverse-engineering intent from the final document alone.

---

# Golden Rules

Every phase must:

✓ Generate output

✓ Validate output

✓ Update traceability

✓ Record assumptions

✓ Log execution

✓ Preserve audit history

✓ Support governance reporting

A phase is not considered complete until the logging step has been evaluated (per the Workflow Completion Rule in [AI_Behavior_Governance.md](AI_Behavior_Governance.md), of which this is one item).
