# AI Governance Notes (2026)

Relevant given this framework itself uses an AI coding agent (Claude Code) and MCP servers (e.g., ARC-1) to build SAP objects.

- SAP AI Agent Hub provides a single control pane for governing AI agents, LLMs, and MCP servers across the enterprise, including a verification badge for which agents/MCP servers are approved for use.
- Practical implication for this framework: before enabling any MCP server (ARC-1 or others) for write access to a real Dev/QA/PRD system, confirm it against your organization's AI governance policy, not just the MCP server's own write-scope settings.
- SAP Domain Models (underlying Joule/Joule Studio) are trained specifically on SAP code, data, metadata, business processes, and documentation — grounded in SAP context rather than generic internet knowledge. Worth knowing as a baseline when comparing SAP-native AI code-gen (Joule) against a general-purpose AI coding agent (Claude Code via this framework) for a given build.
- Code review during `/Code` and `/Testing` should treat AI-agent-generated code (regardless of which AI produced it) with the same scrutiny as human-written code — no exemption for "the AI wrote it."

