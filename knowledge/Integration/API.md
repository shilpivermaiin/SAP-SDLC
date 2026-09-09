# API Integration Notes
- Confirm auth pattern (OAuth2, Basic, certificate) matches what the target system/middleware actually supports.
- Version APIs deliberately; breaking changes need a new version, not silent modification.
- Design explicit error responses, not just HTTP status codes — the calling system needs actionable detail.
