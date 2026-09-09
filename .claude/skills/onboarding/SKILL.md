---
name: onboarding
description: 'Per-phase role/persona check for the SAP-SDLC framework. Not a user-facing command — every phase skill (/Scope, /SolutionArchitect, /FunctionalSpec, /Code, /Testing) invokes this on itself before asking any phase-specific question, to set question depth and language for that phase. /TechnicalSpec never runs it.'
---

# Onboarding (Per-Phase User Profile Check)

## Purpose
Determine the role/technical depth of whoever is working on a given phase, so that phase's questions adapt in complexity and language. This is NOT a one-time project setup — it runs once per `{req-id} + phase}` combination, because different people (Business Analyst, Architect, Functional Consultant, Developer) typically join at different phases, days or weeks apart.

---

## Trigger Logic — when this fires

| Situation | Fires? |
|---|---|
| First time this specific phase is being started for this `{req-id}` | ✅ Yes |
| Resuming the SAME phase, same person, after closing/reopening (phase not yet frozen) | ❌ No — reuse the tag already recorded for this phase |
| Continuing within the same open session, same phase, not yet complete | ❌ No — asked once at phase start, holds for the rest of that phase |
| Moving to the NEXT phase (even same person, same session) | ✅ Yes — new phase = new check |
| A different person picks up a phase with no profile tag recorded yet | ✅ Yes |
| Re-reading an already-frozen phase as input to a later phase | ❌ No — frozen phases are read-only input, nothing to ask |
| `/TechnicalSpec` phase, for any person/role | ❌ No — **phase-level opt-out** (see below), never fires here |

**Rule of thumb:** the check fires once per phase, ever — not once per session, not once per message.

**Phase-level opt-out — `/TechnicalSpec`:** This phase never runs the role check, for anyone. By this phase every business/functional doubt is already resolved and frozen in the BRD/Solution Architect write-up/FS; TS is a design exercise against those fixed inputs, so the executing person's role/technical-comfort has no bearing on question depth or language — the questions TS asks are inherently technical regardless of who answers them. Skip Steps 1–5 below entirely for this phase; do not tag a profile, do not add a row to `profile-history.md`, and proceed directly with TS's normal flow.

## Step 1 — Check for an existing tag on this phase
Look for `execution/{req-id}/{phase-name}.clarifications.md`. If it exists and already has a `Profile:` tag at the top, skip this check entirely and load that tag.

If it doesn't exist yet (this phase hasn't started for this requirement), proceed to Step 2.

## Step 2 — Ask the short role check (single question, not full onboarding)

Ask this through the interactive selection UI (`AskUserQuestion` tool), not as a plain typed list (see [.claude/shared/Clarification_Pattern.md](../../shared/Clarification_Pattern.md) Section 2). The tool allows max 4 options, so condense the five roles into four choices, e.g.:

```
Starting [PhaseName] for {req-id}. Quick check — what's your role for this phase?
- Business user / Business Analyst
- Functional Consultant
- Technical Consultant / Developer
- Architect or Project/Program Manager   (pick "Other" to distinguish)
```

Only ask the follow-up technical-comfort question if the role answer doesn't map cleanly to a profile per the table in Step 3 (e.g., PM needs no follow-up; Functional Consultant might, to distinguish `FUNCTIONAL` from `FUNCTIONAL_TECHNICAL`), again via the selection UI:

```
How comfortable are you with SAP-specific technical terms (tables, BAdIs, OData, transports, etc.)?
- Not comfortable — please explain in plain language
- Somewhat comfortable — explain unfamiliar terms as they come up
- Very comfortable — no need to simplify
```

**Non-blocking:** if the user skips the role check without choosing, do not halt the phase. Default to the safer (more technical) profile — `FUNCTIONAL` for the design/build phases, `BUSINESS_SEMI_TECHNICAL` for `/Scope` — tag it with `Role stated: (not provided — defaulted)`, and proceed. The user can correct it later per Step "Mid-phase profile corrections" in the clarification pattern.

## Step 3 — Map to a profile

| Role | Technical comfort | Resulting Profile |
|---|---|---|
| Business user | Not comfortable | `NON_TECHNICAL` |
| Business user | Somewhat/Very comfortable | `BUSINESS_SEMI_TECHNICAL` |
| Functional Consultant | Not/Somewhat comfortable | `FUNCTIONAL` |
| Functional Consultant | Very comfortable | `FUNCTIONAL_TECHNICAL` |
| Technical Consultant/Developer | (any) | `TECHNICAL` |
| Solution/Technical Architect | (any) | `ARCHITECT` |
| Project/Program Manager | (any) | `PM_OVERSIGHT` |

If ambiguous, default to the more technical profile — safer to occasionally over-explain than under-explain.

## Step 4 — Tag the phase's clarification record
At the top of `execution/{req-id}/{phase-name}.clarifications.md`, before any Q&A content:
```markdown
Profile: FUNCTIONAL
Role stated: Functional Consultant
Date: 2026-08-22
---
```

## Step 5 — Append to the running profile history
Append one row to `execution/{req-id}/profile-history.md` (create if it doesn't exist):
```markdown
| Phase | Profile | Role Stated | Date |
|---|---|---|---|
| FunctionalSpec | FUNCTIONAL | Functional Consultant | 2026-08-22 |
```

## Step 6 — Proceed with the phase, using this profile
Apply the profile's depth/language rules (per [.claude/shared/clarify.md](../../shared/clarify.md) Section 3) to every question this phase asks from this point forward.

---

## Handoff
No separate handoff message needed — this folds invisibly into the start of whichever phase triggered it. The phase's own normal flow continues immediately after Step 6, e.g.:

```
Got it — I'll keep things at a functional level, explaining ABAP/build
terms if they come up.

[Phase's normal first question or context-pull begins here]
```

This check only loads the `Profile:` tag — it does **not** auto-summarize the phase's transcript (see Full Transcript note below) back to the person. If they need to know what's happened so far, they can ask directly and the AI reads the transcript on request.

---

## Full Transcript (this phase's `.clarifications.md` is not just Q&A)
`execution/{req-id}/{phase-name}.clarifications.md` — the same file tagged in Step 4 — is also the running, append-only, verbatim transcript of every user message and every AI response in this phase, for this requirement, from start to freeze. This is what actually lets someone joining mid-phase (or the AI, if asked) reconstruct full context — the `Profile:` tag alone only sets question depth/language, it carries no history. Keep appending to this same file each turn; never write it only once at the end, and never create a second file for it.

---

## Cross-reference
This file works together with [.claude/shared/clarify.md](../../shared/clarify.md) (Section 0 and Section 3), which defines HOW each profile changes question depth/language. This file only defines WHEN and HOW OFTEN the profile check itself happens.
