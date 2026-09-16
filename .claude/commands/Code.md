# /Code

Builds and unit-tests the objects designed in a frozen Technical
Specification, as autonomously as `code/SKILL.md` allows.

Load, in order: `CLAUDE.md`, `.claude/shared/AI_Behavior_Governance.md`,
`.claude/shared/Clarification_Pattern.md`, `.claude/shared/clarify.md`,
`.claude/shared/Versioning_Policy.md`, `.claude/skills/code/SKILL.md`. Then
follow that skill's procedure, including its Hard Gate check against
`Artifacts/TechnicalSpec_<Name>.md`.

Output: `Artifacts/Build_<Name>.md`. Auto-continues into `/Testing` once
done — does not stop to ask.
