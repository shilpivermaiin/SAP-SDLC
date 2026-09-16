# Clarify — Runtime Procedure

The concrete, step-by-step execution of `Clarification_Pattern.md` within a
phase skill.

1. **Collect candidates.** Pull the phase skill's clarification checklist.
   Drop any item already settled by an upstream artifact, by the user's own
   description of the need, or by a prior phase's recorded answer.
2. **Cap and prioritize.** If more than 4 genuinely material questions
   remain, keep the 4 with the largest impact on the artifact's content and
   note the rest as lower-priority assumptions using each checklist item's
   own stated default, flagged ⚠️ — don't spam the user with a long form.
3. **Render the round.** One message/tool call, all questions together:
   - Native UI available → use it, one recommended option first in each
     list, per `Clarification_Pattern.md`.
   - No native UI → numbered list per question, options numbered 1–4, plus
     an explicit "(or type your own answer)" line, plus one sentence
     telling the user any question can be skipped.
4. **Collect the round's outcome** as a single pass — do not go back and
   forth question-by-question.
5. **Resolve each question:**
   - Explicit answer given → use it verbatim.
   - Skipped/no answer → use that question's recommended default, mark ⚠️.
6. **Write the transcript** to `execution/{req-id}/clarifications_<Phase>.md`
   using this shape (best-effort; skip silently on write failure):

   ```markdown
   # Clarifications — <Phase> — <Requirement ID>

   ## Q1: <question text>
   Options offered: <opt1> | <opt2> | <opt3> | <opt4>
   Recommended default: <optN>
   Resolution: <user's answer, or "SKIPPED — assumed default">
   ```

7. **Merge into the artifact.** Carry every resolution into the artifact's
   body where relevant, and list the full round (question, resolution, and
   ⚠️ flag if assumed) in the Assumptions & Clarifications section.
8. **Never revisit** a resolved question later in the same phase. Only
   Governance Principle 9a (Cross-Phase Change Propagation) may reopen it,
   and only after explicit user confirmation to do so.
