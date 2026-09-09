# Release Notes

## v3.0 — Claude Code Migration
- Ported the framework from VS Code + GitHub Copilot to **Claude Code**. Behavior, phase chain, gating, naming, and governance are unchanged — only the platform wiring and file locations moved.
- `.github/copilot-instructions.md` → `CLAUDE.md` (auto-loaded project instructions).
- `.github/prompts/*.prompt.md` → `.claude/commands/*.md` (native slash commands; same `/Scope … /Testing` names).
- `.github/skills/*/SKILL.md` → `.claude/skills/*/SKILL.md` (native Agent Skills; `user-invocable: false` removed, `onboarding` folder lowercased, frontmatter added to the onboarding skill).
- `.github/shared/*` → `.claude/shared/*`; Copilot-only frontmatter (`applyTo`/`appliesTo`/`priority`) converted to a plain priority note.
- `.github/Artifacts/` → top-level `Artifacts/`; all ~60 path references updated across the framework.
- `.vscode/extensions.json` now recommends `anthropic.claude-code`; the Copilot-only `chat.promptFiles` setting removed.
- Fixed pre-existing stale references (`/Systemarchitect` → `/SolutionArchitect`, `Onboarding.command.md`, `no-fabrication-pattern.md`, `logging-pattern.md`).
- `/Code` and `/Testing` now document the MCP-server requirement for SAP connectivity and a manual-build fallback when no server is connected.

## v2.0 — Hierarchy Cleanup
- Removed the parallel skills-based scaffold (`skills/`, `agents/`, `workflows/`, `config/`, `execution/`, `.sapsdlc/`, `CLAUDE.md`) — it duplicated and drifted from the working `.github/prompts/*.prompt.md` commands.
- `.github/prompts/` (Scope, SolutionArchitect, FunctionalSpec, TechnicalSpec, Code, Testing) is now the single source of automation logic.
- `.github/copilot-instructions.md` rewritten to match the prompts' actual behavior (naming, gating, `.github/Artifacts/` as the only output location).
- `knowledge/`, `templates/`, `docs/` kept as optional reference material only — not required for the prompts to function.

## v1.0 (superseded)
- Initial structure built around 12+ skills covering full SDLC (Scope through Deployment), shared boundary-rule layer, workflow variants, and a knowledge base — retired in v2.0 in favor of the prompt-only hierarchy above.

