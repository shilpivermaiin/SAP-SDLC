# Clean Core Certification (2026)

SAP announced a formal Clean Core Certification program at Sapphire 2026 — governance for extensions is now a certifiable discipline, not just informal guidance.

## What this means for builds
- Extensions (in-app or side-by-side) should be evaluated against certifiable clean-core criteria, not just "does it work."
- Never modify SAP-delivered objects (tables, programs, function modules) using traditional enhancement techniques that create upgrade dependencies.
- Use only SAP's official extensibility framework: BAdIs, released APIs, and key user extensibility tools within Fiori for in-app; CAP/side-by-side on BTP for anything beyond that.
- AI-generated code (via Joule/Joule Studio) is designed to be clean-core-compliant by default — but generated output should still be checked against this file's criteria before freeze, not assumed compliant.

## Practical checklist before a build is considered "clean"
- [ ] No modification of standard SAP objects
- [ ] Only released/documented extension points used (BAdIs, APIs, Key User tools)
- [ ] Custom code isolated in Z-namespace, never touching standard namespace
- [ ] If side-by-side: extension lives on BTP, not embedded in the core system
- [ ] Rationale for the extension point chosen is documented in knowledge/decisions/
