---
name: status
description: 'Read-only project status dashboard for the SAP-SDLC framework. Scans Artifacts/ and execution/ to show, per requirement, which of the six phases (Scope through Testing) are complete, in progress, or not started, so anyone picking up a requirement mid-stream knows exactly where it stands and what to do next. Auto-triggers on status/progress questions, or the explicit /Status command.'
---

# Status — SAP-SDLC Project Status Dashboard

> Invoked by the [`/Status`](../../commands/Status.md) command, or auto-triggered directly by this skill's own trigger phrases (see below) — unlike the six phase skills, this one does not require the user to type a slash command first.

> **Governance:** this is a **read-only reporting utility**, not a seventh lifecycle phase. It never edits, freezes, or creates any artifact, never runs the Onboarding role-check, and never asks a clarifying question — it only reads what already exists and reports it. It is not part of the `/Scope → … → /Testing` gate chain and has no Hard Gate of its own.

## Purpose
Give anyone — someone picking up a requirement mid-stream, a reviewer, a manager, or the original owner returning after a break — an accurate, current picture of every SAP-SDLC requirement in this repository: which phases are done, which are in progress, which haven't started, and exactly what command to run next to keep going.

## When This Fires
- The explicit `/Status` command.
- Auto-trigger: the user asks something shaped like a status/progress check without invoking a specific phase command, e.g. "what's the status", "where do things stand", "what's been done so far", "give me a project update", "what's completed and what's pending", "where should I pick this up", "show me an overview", "what requirements are in flight". Treat these the same as an explicit `/Status` call — don't ask permission first, just run it.
- If the user's status question clearly scopes to one requirement ("what's the status of MM-RPT-001") or one phase ("has the BRD been approved"), still run the full scan but present only that requirement/phase in the output.

## Workflow

1. **Sync with GitHub first** — same rule as every other command in [CLAUDE.md](../../../CLAUDE.md)'s Golden Rule: `git pull` (fast-forward) before reading anything, so the dashboard reflects the latest state on GitHub, not a possibly-stale local copy. If git/network access isn't available, proceed against the local copy and say so in the output header.
2. **Discover every requirement** — read every file in `Artifacts/` matching `BRD_*.md`. Each one is one requirement. If `Artifacts/` has no `BRD_*.md` files at all, skip straight to the "No requirements yet" output (see Output Format) — do not fabricate a requirement.
3. **Extract identity from each BRD** — open each `BRD_<name>.md` fully and read its Document Control table for the **Requirement ID** (e.g. `MM-RPT-001`) and **Requirement Name**. This Requirement ID is the link key for every later phase — never assume it from the filename.
4. **Link downstream artifacts by Requirement ID, not by filename pattern** — per [CLAUDE.md](../../../CLAUDE.md)'s Naming Conventions, `BRD_<name>.md` and `SolutionArchitect_<name>.md` share the human-readable `<name>`, but `FunctionalSpec_<ObjectID>.md`, `TechnicalSpec_<ObjectID>.md`, and `Build_<ObjectID>.md` use the frozen Requirement ID as `<ObjectID>` instead — which is typically a different string than `<name>` (e.g. `MaterialSummaryReport` vs `MM-RPT-001`). So for each requirement:
   - Look for `SolutionArchitect_<name>.md` using the same `<name>` as the BRD (open it and confirm its "Linked BRD Ref" points back to this BRD).
   - Look for `FunctionalSpec_<ReqID>.md`, `TechnicalSpec_<ReqID>.md`, `Build_<ReqID>.md` using the Requirement ID extracted in Step 3.
   - Open `Test_Document.md` (if it exists) and look for a section belonging to this Requirement ID — it is one shared file with a section per object, never a separate file per requirement.
5. **Determine each phase's status** from the artifact itself — never guess:
   - **Not Started ❌** — no matching file exists yet.
   - **In Progress ⚠️** — file exists, but its Document Control → Version History table's latest row's "Status at time" is `Draft` or `In Progress`.
   - **Complete ✅** — file exists and its Version History latest row's status is `Frozen` or `Approved`.
   - **Status unclear ⚠️** — file exists but has no readable Version History/status field. Report it as unclear rather than assuming complete or incomplete.
   - For `/Testing`, treat the requirement's section inside `Test_Document.md` the same way using whatever status/sign-off marker that section records (e.g. UAT sign-off row); if the section has open defects, note the open defect count next to the status icon rather than marking it complete.
6. **Pull in "who / when" context if available** — for each phase that's Not Started or In Progress, check `execution/{ReqID}/{phase}.clarifications.md` for a `Profile:`/`Role stated:` tag and the file's last-modified content, and `execution/{ReqID}/profile-history.md` for the most recent row. If present, add a one-line "last worked on" note (role + rough date) per phase — this is informational only, never required, and silently omitted if the file doesn't exist.
7. **Compute the overall summary** — total requirements found; how many are fully complete (all six phases ✅); how many have at least one phase in progress; how many have not moved past `/Scope`.
8. **Render the dashboard** per Output Format below and present it directly in chat — this skill never writes or modifies any file in `Artifacts/` or `execution/`.

## Requirement Linking Rule (mandatory)
Never assume two files belong to the same requirement just because their filenames look similar. Always confirm the link via the Requirement ID / "Linked BRD Ref" fields actually written inside each document. If a downstream file's linkage is ambiguous or contradicts its filename, flag it in the output as "⚠️ linkage unclear" rather than guessing.

## No-Fabrication Rule (applies here too)
- Never invent a requirement, a phase status, or a "last worked on" note that isn't backed by an actual file or field.
- Never mark a phase ✅ Complete on the assumption that "it's probably fine" — only an explicit `Frozen`/`Approved` status counts.
- If a file can't be read or parsed, report that phase as "⚠️ Status unclear — file unreadable" rather than skipping it silently or guessing complete.

## Output Format

Render one dashboard per invocation, structured like this:

```markdown
# 📊 SAP-SDLC Project Status

_Synced with GitHub as of [date/time or commit short-hash]._

## Overall Summary
| Metric | Count |
|---|---|
| Total requirements tracked | N |
| Fully complete (all 6 phases) | N |
| In progress (at least one phase started, not all complete) | N |
| Not yet past Scope | N |

## Requirement: <Requirement ID> — <Requirement Name>
**BRD:** [BRD_<name>.md](../Artifacts/BRD_<name>.md)

| Phase | Status | Detail |
|---|---|---|
| 1. Scope (BRD) | ✅ / ⚠️ / ❌ | Frozen/Approved/Draft/Not started — last worked on note if available |
| 2. Solution Architect | ✅ / ⚠️ / ❌ | ... |
| 3. Functional Spec | ✅ / ⚠️ / ❌ | ... |
| 4. Technical Spec | ✅ / ⚠️ / ❌ | ... |
| 5. Code (Build) | ✅ / ⚠️ / ❌ | ... |
| 6. Testing | ✅ / ⚠️ / ❌ | ... (note open defect count if any) |

**👉 Pick up here:** <plain-language statement of exactly what's next, naming the next command to run, e.g. "Run /FunctionalSpec — Solution Architect write-up is signed off and waiting.">

---
(repeat the above block per requirement)
```

If no requirements exist yet:
```markdown
# 📊 SAP-SDLC Project Status

No requirements have been started yet. Run `/Scope` (or just describe a new SAP business need) to begin the first one.
```

## Guardrails
- Read every artifact and clarification file in full before reporting on it — never truncate and infer.
- Never edit, freeze, sign off, or create any file as a side effect of running this skill.
- Never ask the user a clarifying question as part of this skill — if something is genuinely ambiguous, report it as "⚠️ unclear" in the dashboard instead of stopping to ask.
- Keep the tone neutral and factual — this is a status report, not a judgment of anyone's pace or performance.
- If the user asks a follow-up like "what does the Functional Spec still need" after seeing the dashboard, answer directly from the artifact rather than re-running the whole scan unnecessarily.
