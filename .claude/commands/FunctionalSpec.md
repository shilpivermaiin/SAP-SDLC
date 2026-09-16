# /FunctionalSpec

Produces the functional specification for a requirement whose Solution
Architecture is frozen.

Load, in order: `CLAUDE.md`, `.claude/shared/AI_Behavior_Governance.md`,
`.claude/shared/Clarification_Pattern.md`, `.claude/shared/clarify.md`,
`.claude/shared/Versioning_Policy.md`,
`.claude/skills/functional-spec/SKILL.md`. Then follow that skill's
procedure, including its Hard Gate check against
`Artifacts/SolutionArchitect_<Name>.md`.

Output: `Artifacts/FunctionalSpec_<Name>.md`. Next command in the chain:
`/TechnicalSpec`.
