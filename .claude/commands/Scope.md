# /Scope

Kicks off a new SAP business requirement (or resumes an existing one) and
produces/updates its BRD.

Load, in order: `CLAUDE.md`, `.claude/shared/AI_Behavior_Governance.md`,
`.claude/shared/Clarification_Pattern.md`, `.claude/shared/clarify.md`,
`.claude/shared/Versioning_Policy.md`, `.claude/skills/onboarding/SKILL.md`,
`.claude/skills/scope/SKILL.md`. Then follow `scope/SKILL.md`'s procedure.

A plain-language description of a new SAP business need, with no `/Scope`
typed, is treated as an implicit invocation of this command.

Output: `Artifacts/BRD_<Name>.md`. Next command in the chain:
`/SolutionArchitect`.
