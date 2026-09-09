---
description: Governs when a requirement re-enters an already-completed lifecycle as a new version (v2, v3, ...) instead of silently overwriting Frozen/Approved documents. Cross-cutting rule, applies to every phase.
---

> **Priority: Mandatory.** Cross-cutting rule — every phase (`/Scope`, `/SolutionArchitect`, `/FunctionalSpec`, `/TechnicalSpec`, `/Code`, `/Testing`) must check it before starting work on a requirement that may already exist.

# Requirement Versioning Policy

## Purpose

Once every document for a requirement is Frozen/Approved end to end (Scope through Testing), those documents are closed history — evidence that the requirement, as specified, was delivered and tested. If the user later asks to change, regenerate, or add to any phase of that same requirement, silently editing the frozen documents would destroy that audit trail.

This policy defines exactly when to ask the user whether the change should instead become **Version 2** (or the next version) of the requirement, and how to apply that version bump consistently across every affected document.

This is a **cross-cutting rule** — every skill (`/Scope`, `/SolutionArchitect`, `/FunctionalSpec`, `/TechnicalSpec`, `/Code`, `/Testing`) must check it before starting work on a requirement that may already exist.

---

## Step 1: Is This Requirement "Full Lifecycle Complete"?

Check every document belonging to the requirement (identified by its `<name>` from the BRD, spanning every Object ID listed in that requirement's Solution Architect "What Will Be Built" table). Full Lifecycle Complete means **all** of the following are true:

| Document | Required Status |
|---|---|
| `BRD_<name>.md` | Document Control → Status = ✅ Approved |
| `SolutionArchitect_<name>.md` | Document Control → Status = ✅ Frozen |
| `FunctionalSpec_<ObjectID>.md` (every Object ID) | Document Control → Status = ✅ Frozen |
| `TechnicalSpec_<ObjectID>.md` (every Object ID) | Document Control → Status = ✅ Frozen |
| `Build_<ObjectID>.md` (every Object ID) | Document Control → Status = ✅ Complete |
| `Test_Document.md`, this Object ID's section (every Object ID) | UAT signed off, zero open defects |

> Per the Object ID default rule ([CLAUDE.md](../../CLAUDE.md), Naming Conventions), `<ObjectID>` is normally the requirement's own Requirement ID (one Object ID per requirement, covering every RICEFW row together) — so in the common case this table has exactly one Object ID to check, not one per RICEFW row.

If **any** row is missing, Draft, In Progress, or has open defects — this is ordinary in-flight work. Proceed with the normal Hard Gate / Change Control behavior (Principle 9 in [AI_Behavior_Governance.md](AI_Behavior_Governance.md)). Do **not** ask the versioning question.

---

## Step 2: When to Trigger the Versioning Question

Trigger only when **both**:
1. The requirement is Full Lifecycle Complete (Step 1), **and**
2. The user asks to regenerate, modify, add to, or redo any phase's document for that same requirement — regardless of which phase they name.

When triggered, before changing any content, ask exactly:

> "This requirement's full lifecycle (Scope → Testing) is already complete and every document is Frozen/Approved. Do you want to raise this as **Version 2** of the requirement? (yes / no)"

- **Yes** → follow Step 3 (Version Bump Procedure).
- **No** → this becomes a direct edit to existing frozen content. Still requires the user's explicit confirmation per Principle 9 (Change Control), must **not** bump the version, and must flag clearly that this breaks the "Frozen = immutable" convention before proceeding.

---

## Step 3: Version Bump Procedure (on "yes")

1. **New version number** = current Version (Document Control field) + 1 (e.g., `1.0` → `2.0`). Use the same version number across every document belonging to this requirement — never let individual documents drift to different version numbers.
2. In the document the user asked to change, **and every document downstream of it in the phase chain** (a change at an earlier phase invalidates frozen decisions built on top of it — same cascade logic as the phase Hard Gates):
   - Document Control → bump **Version** to the new number.
   - Document Control → reset **Status** to 🟡 Draft / 🟡 In Progress (no longer Frozen/Approved/Complete) until re-frozen through that phase's own Freeze/Post-Save Confirmation step.
   - **Version History** table (directly under Document Control) → append a new row. Never remove or edit prior rows — they are the audit trail of what Version 1 (or earlier) looked like.
3. Documents untouched by this change (an earlier phase not being revisited, or a sibling Object ID with no relation to the requested change) keep their existing version number and Frozen/Approved status — versioning cascades forward from the point of change, not a whole-project reset.
4. Re-run that phase's own normal workflow (its Ask-the-User, Freeze Confirmation/Post-Save Confirmation, Save to Artifacts) to produce the new version's content. This policy governs **when** to version, not the phase's own content-generation steps.
5. Filenames do not change — one file per `<name>`/`<ObjectID>` remains the single authoritative artifact. Version history lives inside the file via the Version History table, never via duplicate/renamed files.

---

## Version History Table

Every phase's Document Control section (Section 1 of its Output Format template) includes this table immediately below the Document Control fields:

```markdown
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | | | Initial creation | ✅ Frozen/Approved |
```

Append one row per version bump. This table is the single place version-over-version change history is recorded — never duplicate it elsewhere in the document.

---

## Non-Triggers (do NOT ask the versioning question)

- Mid-lifecycle edits, i.e. anywhere before `/Testing` has fully signed off — this is normal in-flight iteration.
- A defect found in `/Testing` routed back to `/Code` for a fix, then re-entering `/Testing` — ordinary defect resolution (Open → In Progress → Fixed → Retested → Closed), not a new version.
- Typo/formatting corrections to an already-frozen document that don't change business or technical meaning — flag as a minor in-place fix instead (still confirm with the user), no version bump.

---

## If You Cannot Determine Completeness

If an upstream document is referenced but not found, or its Document Control Status can't be read, do not assume either way. Ask the user directly whether the full lifecycle is complete for this requirement before deciding whether to trigger the versioning question.
