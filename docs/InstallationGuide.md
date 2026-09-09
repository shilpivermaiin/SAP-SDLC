# Installation Guide

## Prerequisites
- [Claude Code](https://docs.claude.com/en/docs/claude-code) — the CLI, or the VS Code / JetBrains extension
- (Optional) An MCP server configured for direct SAP connectivity (e.g. ARC-1), if you want `/Code` and `/Testing` to create/activate objects and run tests directly in the connected SAP system

## Setup
1. Clone/copy this SAP SDLC folder as your project root and open it in Claude Code.
2. Confirm `CLAUDE.md` and `.claude/commands/*.md` are present — Claude Code picks these up automatically (`CLAUDE.md` as project instructions, `.claude/commands/` as slash commands, `.claude/skills/` as skills).
3. If using an MCP server for SAP connectivity, configure it in `.mcp.json` at the project root (or your user-level MCP config) per your organization's setup. The `/Code` and `/Testing` phases call SAP tools such as `SAPWrite`, `SAPActivate`, `SAPDiagnose`, and `SAPTransport`; without a server that provides them, those phases fall back to recording a manually-run build/test.
4. Adjust the naming conventions in [config/naming-standards.json](../config/naming-standards.json) to match your organization's standards before starting real requirements.
5. Run `/Scope` to begin.
