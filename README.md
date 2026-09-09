# SAP SDLC

An AI-assisted, end-to-end SAP SDLC automation project for **Claude Code** — from business requirement to deployed, tested code — driven entirely by 6 chained slash commands.

## The chain
```
/Scope → /SolutionArchitect → /FunctionalSpec → /TechnicalSpec → /Code → /Testing
```
Each command reads its upstream artifact, asks clarifying questions in one batched round, freezes a document with the user's explicit sign-off, and hands off to the next phase. A phase will not start until its required upstream artifact is frozen and approved.

## Project structure
```
CLAUDE.md                       # framework rules: phase boundaries, no-fabrication, naming, gating (auto-loaded)
.claude/
├── commands/                   # the 6 slash commands — lean entry points + Hard Gates
│   ├── Scope.md
│   ├── SolutionArchitect.md
│   ├── FunctionalSpec.md
│   ├── TechnicalSpec.md
│   ├── Code.md
│   └── Testing.md
├── skills/                     # one skill per command — the full procedure each command reads before acting
│   ├── onboarding/SKILL.md
│   ├── scope/SKILL.md
│   ├── solution-architect/SKILL.md
│   ├── functional-spec/SKILL.md
│   ├── technical-spec/SKILL.md
│   ├── code/SKILL.md
│   └── testing/SKILL.md
└── shared/                     # cross-cutting governance rules that apply to every phase
    ├── AI_Behavior_Governance.md
    ├── Clarification_Pattern.md
    ├── clarify.md
    ├── Execution_Logging.md
    ├── Versioning_Policy.md
    └── Workflow_Overview.md
Artifacts/                      # generated output — BRD, Architecture, FS, TS, Build, Test docs
execution/<req-id>/             # per-requirement clarification transcripts and profile history
config/naming-standards.json    # Z-prefix, requirement ID pattern, ABAP naming rules
knowledge/                      # optional reference material (SAP best practices, guidelines)
templates/                      # optional flattened copies of each command's output structure
docs/                           # installation guide, user guide, release notes
```

## Getting started
1. Open this folder in Claude Code (CLI, or the VS Code / JetBrains extension). `CLAUDE.md` and `.claude/commands/*` are picked up automatically.
2. Run `/Scope` and describe your business need.
3. Follow the chain — each command tells you what to run next.
4. Check `Artifacts/` for your generated documents.

See [docs/InstallationGuide.md](docs/InstallationGuide.md) and [docs/UserGuide.md](docs/UserGuide.md) for more detail.

## Naming conventions
| Item | Pattern | Example |
|---|---|---|
| Custom object prefix | `Z*` | `ZCL_SALES_RPT`, `ZIF_SALES_RPT` |
| Package | `Z{MODULE}_{AREA}` | `ZSD_SALESRPT` |
| Requirement ID | `{MODULE}-{TYPE}-{NNN}` | `SALES-RPT-001` |
| CDS views | `Z*_I` (interface) / `Z*_C` (consumption) | `ZSD_I_SALESORDER` |
| Transport description | Must include the requirement ID | |

Full rules live in [config/naming-standards.json](config/naming-standards.json).

## Core principles
- **Specification-driven** — every artifact in `Artifacts/` is the source of truth for the next phase.
- **One phase, one question** — see the Phase Boundary Table in [CLAUDE.md](CLAUDE.md).
- **No fabrication** — commands formalize what you provide; they don't invent business rules or technical objects.
- **Gated progression** — each command has a Hard Gate that blocks the next phase until its document is frozen and signed off.
