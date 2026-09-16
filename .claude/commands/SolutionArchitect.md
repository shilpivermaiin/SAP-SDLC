# /SolutionArchitect

Produces the solution architecture for a requirement whose BRD is frozen.

Load, in order: `CLAUDE.md`, `.claude/shared/AI_Behavior_Governance.md`,
`.claude/shared/Clarification_Pattern.md`, `.claude/shared/clarify.md`,
`.claude/shared/Versioning_Policy.md`,
`.claude/skills/solution-architect/SKILL.md`. Then follow that skill's
procedure, including its Hard Gate check against `Artifacts/BRD_<Name>.md`.

Output: `Artifacts/SolutionArchitect_<Name>.md`. Next command in the chain:
`/FunctionalSpec`.
