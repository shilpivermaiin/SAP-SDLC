# /Testing

Produces or extends the running test document for a requirement whose
Build & Unit Test Record exists.

Load, in order: `CLAUDE.md`, `.claude/shared/AI_Behavior_Governance.md`,
`.claude/shared/Clarification_Pattern.md`, `.claude/shared/clarify.md`,
`.claude/shared/Versioning_Policy.md`, `.claude/skills/testing/SKILL.md`.
Then follow that skill's procedure, including its Hard Gate check against
`Artifacts/Build_<Name>.md`.

Output: `Artifacts/Test_Document.md` (a single running document — appended
to, never overwritten). This is the final phase in the chain.
