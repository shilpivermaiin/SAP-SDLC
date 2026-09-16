# /TechnicalSpec

Produces the technical specification for a requirement whose Functional
Spec is frozen. This phase never runs the onboarding skill.

Load, in order: `CLAUDE.md`, `.claude/shared/AI_Behavior_Governance.md`,
`.claude/shared/Clarification_Pattern.md`, `.claude/shared/clarify.md`,
`.claude/shared/Versioning_Policy.md`,
`.claude/skills/technical-spec/SKILL.md`. Then follow that skill's
procedure, including its Hard Gate check against
`Artifacts/FunctionalSpec_<Name>.md`.

Output: `Artifacts/TechnicalSpec_<Name>.md`. Next command in the chain:
`/Code`.
