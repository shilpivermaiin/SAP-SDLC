# Git Workflow — Per-Requirement Branch Publishing

> Referenced by every skill's Finalization/Post-Save Confirmation step, right after [Execution_Logging.md](Execution_Logging.md) is applied. Priority: mandatory, same tier as Execution Logging.

## Purpose
Every requirement gets its own GitHub branch, named exactly after its Requirement ID, containing **nothing but that requirement's own frozen documents** — kept separate from the framework's own working branch(es) so anyone opening that branch on GitHub sees a clean, requirement-scoped document set with no framework clutter (`.claude/`, `config/`, `execution/`, `knowledge/`, `templates/`, `docs/`, other requirements' documents, etc.).

This is a **publishing/export** concern layered on top of the normal phase flow — it never changes where a phase reads from or writes its primary artifact. `Artifacts/<file>.md` on the framework's own working branch remains the single source of truth for every phase. The requirement branch is a derived, one-way view of that source of truth.

## Trigger — when a requirement's branch is created
- At `/Scope`'s Post-Save Confirmation step, the moment the user explicitly **Agrees** to the BRD (not before — an unconfirmed draft is never published). The Requirement ID is already known at this point, from the BRD's Document Control table (`{MODULE}-{TYPE}-{NNN}` per `config/naming-standards.json`).
- If a branch with that exact name already exists on the remote (e.g., resuming a requirement in a later session), reuse it — never create a duplicate, never overwrite its history.

## How the branch is built
Created as an **orphan branch** — no shared history with `main`/`SAP-SDLC` or any other requirement branch, guaranteeing it can never accidentally carry a framework file:

1. `git checkout --orphan <ReqID>`
2. `git rm -rf --cached .` (clears the index for the new branch; working-tree files on disk are untouched)
3. Stage only this requirement's own file(s) — see **What gets included** below — into a fresh `Artifacts/` folder for the commit. Nothing else is staged.
4. `git commit -m "Initial <ArtifactType> for <ReqID>"`
5. `git push -u origin <ReqID>`
6. Switch back to the branch that was active before this sync (the framework's working/dev branch, e.g. `SAP-SDLC`) so the session's own working context is undisturbed. Never leave the session parked on a requirement branch.

## What gets included — Artifacts-only, this requirement's own files
Only the files for *this* requirement, matched by its Requirement ID / `<name>` placeholder (per the Naming Conventions table in [CLAUDE.md](../../CLAUDE.md)):

| File | Included once this phase is frozen |
|---|---|
| `BRD_<name>.md` | `/Scope` |
| `SolutionArchitect_<name>.md` | `/SolutionArchitect` |
| `FunctionalSpec_<ReqID>.md` | `/FunctionalSpec` |
| `TechnicalSpec_<ReqID>.md` | `/TechnicalSpec` |
| `Build_<ReqID>.md` | `/Code` |
| `Test_Document.md` (requirement-scoped extract — see below) | `/Testing` |

Nothing else ever lands on this branch — no `.claude/`, `config/`, `execution/`, `knowledge/`, `templates/`, `docs/`, `.sapsdlc/`, root-level framework files, or another requirement's documents.

### Test_Document.md — shared file, requirement-scoped extract
The master `Artifacts/Test_Document.md` is explicitly a single shared file covering every requirement's test cases (new objects get a new section, never a new file — see [CLAUDE.md](../../CLAUDE.md)). Copying it onto a requirement branch unfiltered would defeat the "only this requirement's documents" intent. Instead:
- Extract only the section(s) belonging to this Requirement ID / Object ID from the master file.
- Write that extract to `Test_Document.md` on the requirement branch, with the same section structure/headings as the master, just scoped to this one requirement.
- Testing is still part of the requirement's lifecycle and must still appear on the branch — it is extracted, never omitted and never included unfiltered.

## Sync — keeping the branch current through later phases
After every phase's own Finalization + Post-Save Confirmation **Agree** step (`/Scope`, `/SolutionArchitect`, `/FunctionalSpec`, `/TechnicalSpec`, `/Code`, `/Testing`), automatically:

1. `git checkout <ReqID>` (create it per **How the branch is built** if this is the first phase to freeze for this requirement).
2. Add or overwrite only the file(s) that changed this phase in the branch's `Artifacts/` folder (e.g. `/FunctionalSpec` adds `FunctionalSpec_<ReqID>.md`; `/Testing` refreshes the extracted `Test_Document.md` section). Leave every other file on the branch untouched.
3. `git commit -m "Update <ArtifactType> for <ReqID>"` (or `"Initial <ArtifactType> for <ReqID>"` the first time that file appears on the branch).
4. `git push origin <ReqID>`.
5. Switch back to the branch that was active before this sync.

This sync is silent/internal, consistent with Execution Logging — do not narrate the git mechanics turn by turn. A short confirmation line is enough, e.g.:
```
✅ Pushed to branch `SALES-RPT-001` on GitHub.
```

## Failure handling
If the push fails for any reason (no network, auth, remote rejected, branch protection, etc.), do not block or fail the phase — the local `Artifacts/<file>.md` was already saved per the phase's own Finalization step and remains the source of truth. Tell the user the branch sync failed, briefly say why, and that they can ask to retry it. Never silently drop the failure.

## Relationship to the framework's own branches
`main` and `SAP-SDLC` (the framework's own branches) carry the full framework — `.claude/`, `config/`, `knowledge/`, `templates/`, `docs/`, plus the complete, multi-requirement `Artifacts/` folder as the actual source of truth. Per-requirement branches are a derived, one-way publishing view for sharing a single requirement's documents cleanly. They are:
- Never where framework changes or cross-requirement edits are made.
- Never merged back into `main`/`SAP-SDLC` (merging would reintroduce the framework files that were deliberately excluded, defeating the purpose).

## Versioning note
If a requirement later re-enters as Version 2 (per [Versioning_Policy.md](Versioning_Policy.md)), continue using the **same** `<ReqID>` branch — never create a `<ReqID>-v2` branch. The branch already represents that requirement's document set across its full lifecycle, including later versions; new/updated documents simply sync onto it the same way.
