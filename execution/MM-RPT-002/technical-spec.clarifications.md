# Technical Spec Phase — Clarification & Transcript Log — MM-RPT-002 (Multilevel BOM Excel Export Report)

Note: `/TechnicalSpec` does not run the onboarding role-check per its own skill definition (by this phase all business/functional questions are frozen upstream) — no `Profile:` tag, no `profile-history.md` entry for this phase.

## Entry Criteria & Config Review
- FS reviewed in full: `Artifacts/FunctionalSpec_MM-RPT-002.md`.
- FS Section 10 open items found: design owner pending, SLA not specified, Teamcenter Object Type mapping values pending business confirmation.
- Raised to user: how should TS proceed given the pending TC Object Type mapping values?
  - A: "Proceed with TS as-is (recommended)" — treated as a business-data risk carried forward, not a structural blocker.

## Reuse Assessment (2a) & Clean Core Assessment (2b)
- Q: Confirm no other FS/TS in this repo covers overlapping functionality?
  - A: Confirmed — no overlap
- Q: Has this capability been built before in another system (beyond the design-pattern reference already noted)?
  - A: No, not built elsewhere
- Q: Confirm no SAP standard object modification is needed?
  - A: Confirmed — no modifications
- (2b Check 1 "prefer RAP/CDS/released APIs" and Check 3 "unreleased API" were NOT asked — recorded as N/A/inherited per the classic-ABAP approach already fixed in the Solution Architect write-up, per this skill's explicit instruction not to re-litigate an upstream-fixed approach.)

## Genuine Build Decisions Gathered
- Q: XLSX generation technical approach?
  - A: ABAP2XLSX library (recommended option)
- Q: Output file naming pattern?
  - A: `<Material Number>_<YYYY>_<MM>_<DD>.xlsx` (recommended option)
- Q: Logical File Path/Name naming — config/naming-standards.json had no convention for this object type (a real gap, per the config's own governance rule). OK to propose names and flag/close the gap?
  - A: Yes, propose names and flag the gap.
  - Action taken: added a new `fileHandling` section to `config/naming-standards.json` (`logicalFilePath`: `Z{MODULE}_{PURPOSE}_PATH`, `logicalFileName`: `Z{MODULE}_{PURPOSE}_FILE`), committed and pushed separately (commit 849646b) before the TS document itself was frozen, per the repo's stop-hook requiring no uncommitted changes between turns.

## Naming Derivation (from config/naming-standards.json, Module=MM, Purpose=BOM_EXPORT)
- Program: ZMM_BOM_EXPORT
- Transaction Code: ZMM001
- Package: ZMM_BOM
- Structure: ZST_BOM_EXPORT / Table Type: ZTT_BOM_EXPORT
- Message Class: ZMM_BOM_EXPORT
- Logical File Path: ZMM_BOM_EXPORT_PATH / Logical File Name: ZMM_BOM_EXPORT_FILE
- Local classes (internal, program-scoped): LCL_TC_CLASSIFIER, LCL_TEXT_READER, LCL_BOM_EXPLODER

## Freeze Confirmation
- Presented full ✅/⚠️ status summary (two ⚠️ items: XLSX generation approach assumption, Logical File Path/Name newly proposed + Basis dependency carried forward).
- User confirmed: "yes" — froze the document as presented.

## Document saved
- `Artifacts/TechnicalSpec_MM-RPT-002.md`
- `config/naming-standards.json` updated (fileHandling section added)

## Open items carried forward to /Code
- Teamcenter Object Type classification mapping values: still pending final business confirmation (carried from BRD → FS → TS)
- ABAP2XLSX library availability: to be verified as a build-time prerequisite
- Logical File Path physical directory setup: Basis-team dependency (carried from Solution Architect write-up)
- Design owner and SLA target: still pending (carried from FS, non-blocking)
