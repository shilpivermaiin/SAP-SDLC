# Clarification Pattern (Shared Reference) — Persona-Aware

> Referenced by every skill whenever it needs missing information from the user.

## Step 0 — Load the phase's profile FIRST (per-phase, not per-project)
Before generating any question, check `execution/{req-id}/{phase-name}.clarifications.md` for an existing `Profile:` tag.
- Tag exists -> load it silently, do not re-ask.
- Tag doesn't exist -> this phase hasn't been onboarded yet for this requirement. Run the [onboarding](../skills/onboarding/SKILL.md) skill's short role check (one question, not a full re-onboarding) before proceeding with anything else in this phase.

This check fires once per `{req-id} + phase}` combination — never once per session, never once per message, and never assumed to carry over from a different phase or a different person. See [.claude/skills/onboarding/SKILL.md](../skills/onboarding/SKILL.md) for the full trigger table (a Business Analyst's profile on `/Scope` does not carry over to an Architect joining days later for `/SolutionArchitect`).

Apply the loaded `profile` value to every rule below, for this phase only.

## 1. Batch, don't drip
Ask all currently-needed questions together in one turn, not across multiple back-and-forths — regardless of profile.

## 2. Format as selectable options, and never block on an answer
Present every clarifying question as a set of **selectable choices** the user can pick from (the interactive selection UI / `AskUserQuestion` tool), not as a plain lettered/numbered list the user has to type a reply into. Keep each question to a small set of likely answers (the tool allows at most 4 options — condense longer sets by combining the less-likely choices); a free-text "Other" path is always available for genuinely open-ended input.

**Clarifying questions are non-blocking.** The user may proceed without selecting anything (submit empty / just press enter). If the user skips a question, do **not** re-ask it, halt, or refuse to continue — proceed using a clearly-labelled assumption per the No-Fabrication Rule (⚠️ "Assumed: … — please confirm") and carry on to the next step. Progress is never gated on the user answering a clarifying question.

## 3. Adapt depth and language to the loaded profile
| Profile | Depth | Language |
|---|---|---|
| `NON_TECHNICAL` | Minimum viable — business-meaning only | Plain language; define any unavoidable term inline on first use; escalate genuinely technical questions to "would you like me to simplify this, or should your technical team answer it?" rather than pushing jargon |
| `BUSINESS_SEMI_TECHNICAL` | Slightly above minimum | Plain by default; technical terms allowed with a brief inline definition |
| `FUNCTIONAL` | Full FS-level depth (business rules, standard SAP object facts) | SAP functional terms assumed known; explain ABAP/build terms if they arise |
| `FUNCTIONAL_TECHNICAL` | Full FS + light TS-adjacent | Minimal simplification |
| `TECHNICAL` | Full technical depth | No simplification |
| `ARCHITECT` | Full depth across all phases | No simplification |
| `PM_OVERSIGHT` | Minimum on content; full on status/risk/approval | Plain, outcome-framed; redirect content questions to the actual owner rather than asking the PM to answer them |

Depth and language are governed by the **profile**, not by which phase is running — a `TECHNICAL` user running `/Scope` still gets full technical language; a `NON_TECHNICAL` user running `/TechnicalSpec` (unusual, but possible) still gets plain language, with heavier escalation to "loop in your technical team" since that phase is inherently technical.

## 4. Never skip a required question — translate or escalate instead
If a question is genuinely necessary to produce a correct artifact, do not omit it because the profile is `NON_TECHNICAL` or `PM_OVERSIGHT`. Instead:
- Translate it into plain-language terms if a meaningful translation exists, or
- Explicitly offer to loop in someone with the right expertise, and pause there rather than guessing an answer on the user's behalf (this would violate the No-Fabrication Rule in [AI_Behavior_Governance.md](AI_Behavior_Governance.md)).

## 4a. Never ask about project schedule
Do not ask the user about project deadlines, delivery dates, go-live timing, or schedule/timeline constraints in any phase's clarification round — these are project-management concerns and are not needed to produce any SDLC artifact. If the user volunteers a date, record it where relevant; otherwise leave the topic out entirely (do not raise it, and do not record "no deadline" as an assumption).

## 5. One round, then proceed
Don't fire a second full round unless the first answer created a new, genuinely blocking gap. Prefer a flagged assumption over a third round — this applies regardless of profile, though `NON_TECHNICAL` users may need slightly more explanation text per question, not more rounds. The same applies to questions the user simply left unanswered (see Section 2): move forward with a labelled assumption, never loop back to press for an answer.

## 6. Never re-ask known information
Never re-ask something already stated earlier in the conversation, present in a linked upstream artifact, or already tagged in this phase's own clarification record (e.g., don't re-ask the role check twice within the same phase).

## 7. Profile does not carry across phases automatically
Each phase gets its own profile check (Step 0), because different people typically own different phases. Do not assume the Architect who set `/SolutionArchitect`'s profile is the same person who will answer `/FunctionalSpec`'s questions — that phase runs its own check per [.claude/skills/onboarding/SKILL.md](../skills/onboarding/SKILL.md).

## 8. State why, briefly
One short line of context before the question list — for `NON_TECHNICAL`/`PM_OVERSIGHT` profiles, this line matters more (it frames why a question is being asked at all) and should lean slightly more explanatory than for `TECHNICAL`/`ARCHITECT` profiles.

## 9. Mid-phase profile corrections
If the user says something like "I'm actually more technical than that" mid-phase, update this phase's tag in `execution/{req-id}/{phase-name}.clarifications.md` and confirm before continuing — but this does not retroactively change any other phase's already-recorded profile.

Every turn of this phase — every question asked, every user answer/choice, and the AI's resulting response — must still be appended verbatim to `execution/{req-id}/{skill-name}.clarifications.md` per [Execution_Logging.md](Execution_Logging.md), including which profile was active at the time. This file is the full running transcript for this phase, for this requirement, not just a Q&A summary — it's what lets a new person picking up this phase mid-way (or the AI itself) reconstruct full context on request. It is reference material only: Onboarding loads just the `Profile:` tag automatically and does not auto-recap this transcript to the new person.
