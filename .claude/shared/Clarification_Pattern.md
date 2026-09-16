# Clarification Pattern

Defines *what* a clarifying-question round looks like and *when* to run
one. The runtime mechanics of executing the pattern are in `clarify.md`.

## When to run a round

Once per phase invocation, after the skill has read all upstream artifacts
and before drafting the phase's output artifact. Build the candidate list
of open questions from the phase skill's own checklist — only include a
question if the answer would materially change the artifact's content.
Don't ask about things the upstream artifact, or the business need as
already stated by the user, already answers.

## Structure of one question

Each question has:
- A short, concrete question string.
- Up to 4 concrete answer options, each a real, specific choice — never
  vague placeholders like "Option A".
- One option explicitly marked as the **recommended default** — this is
  what gets assumed if the question is skipped.
- Room for the user to type a free-form answer instead of picking an
  option.

## Presenting the round

- If the host surface offers a native multi-choice/quick-reply UI, use it.
- Otherwise, present the whole round as a single message: each question as
  a short numbered list of its options (plus an explicit "type your own
  answer" option), and state plainly in that same message that any
  question can be skipped and the recommended default will be used.
- Always present all of a phase's questions in one round — never trickle
  them out one at a time across turns.

## Handling answers

- Answered questions: use the answer as given.
- Skipped questions (no answer, or an explicit "skip"): use the labeled
  recommended default, and record it in the artifact's Assumptions &
  Clarifications section prefixed with ⚠️.
- Never re-ask a question already answered or skipped in this phase, and
  never re-ask it in a later phase unless Cross-Phase Change Propagation
  (`AI_Behavior_Governance.md`, Governance Principle 9a) explicitly reopens
  that area.
- Never let an unanswered clarifying question block artifact creation —
  only a failed Hard Gate check blocks progress.

## Recording the round

Every question, its options, the recommended default, and the actual
resolution (user's answer or the assumed default) is written to the
artifact's Assumptions & Clarifications section, and the full transcript is
logged per `Execution_Logging.md` (best-effort; skip silently if the log
path isn't writable).
