# Onboarding Skill

Runs once per new requirement, at the start of `/Scope` only (per
`CLAUDE.md`'s routing table, `/TechnicalSpec` never runs this skill, and in
practice it's a no-op for every phase after Scope since the Requirement ID
and Name are already fixed).

## When to actually run it

- **New requirement** (no existing `Artifacts/BRD_*.md` covering this
  business need): run the full procedure below.
- **Continuing/amending an existing requirement** (the user is adding to or
  correcting a BRD that already exists, frozen or not): skip onboarding —
  reuse the existing Requirement ID, Name, and `execution/{req-id}/` folder
  instead of assigning new ones.

## Procedure

1. **Determine Requirement ID.** List `Artifacts/BRD_*.md`, read each one's
   Document Control table, find the highest `REQ-####`, and assign the next
   sequential number, zero-padded to 4 digits. If none exist, start at
   `REQ-0001`.
2. **Determine Requirement Name.** Derive a short, descriptive PascalCase
   slug from the business need (no spaces, no special characters, ideally
   under 40 characters), e.g. "supplier tax number on PO header" →
   `SupplierTaxNumberOnPOHeader`. Confirm the derived name reads sensibly;
   don't ask the user to bikeshed it.
3. **Determine requester.** Use the identity available in context (e.g. the
   session user) as "Prepared By" unless the user states someone else is
   the actual business requester.
4. **Determine module/area** (e.g. MM, SD, FI) from the business need as
   described; if genuinely ambiguous, fold it into the Scope phase's
   clarification round rather than asking separately here.
5. **Create the execution folder.** Best-effort create
   `execution/{req-id}/profile.md` with the Requirement ID, Name, module,
   requester, and date. Skip silently if this can't be written.

Hand off Requirement ID and Name to `.claude/skills/scope/SKILL.md`.
