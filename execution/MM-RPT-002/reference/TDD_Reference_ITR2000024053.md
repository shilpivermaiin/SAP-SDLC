# Reference Source Document — Requirement MM-RPT-002

**Source file**: `Functional_and_technical_description_2000024053.docx` (uploaded by user, 2026-09-17)
**Document title**: TDD Enhancement — PP - ITR 2000024053-3100: Export BoM via Excel from SAP to TC
**Change Request**: 2000024084
**Functional Section author**: Daniel Proteasa (v1, 16.08.2026)
**Technical Section author**: (not yet filled in source, placeholder "xxx")
**SAP Service Owner / Integration Manager**: May Andreas
**Team**: PP | **System**: DNP – NENA Production system

> This is a raw reference extract preserved for `/SolutionArchitect`, `/FunctionalSpec`, and `/TechnicalSpec` to consult. It is NOT itself a frozen SAP-SDLC artifact — each phase must still apply its own Boundary Rule and No-Fabrication Rule when drawing from it (e.g. `/FunctionalSpec` may use the field/business-rule content; only `/TechnicalSpec`/`/Code` may use the object names, table names, and FM names below).

---

## Selection Screen Fields (source doc naming)
| Field | Description | Domain | Data type |
|---|---|---|---|
| Z_MATNR | Material Number | MATNR | CHAR(18) |
| Z_WERKS | Plant | WERKS | CHAR(4) |
| Z_DATUV | Valid from | DATUM | DATS(8) |

Plus: output destination choice — Application Server (via a predefined Logical Path) or Local File. Same file-naming convention applies to both. Filename convention noted in comments: `Year_month_day` pattern, e.g. `xxxx_xx_xx.xlsx`. One reviewer comment: "It can be predefined on 3100" (re: logical path / plant default) and "Just in case XLSX is not possible!" (re: fallback to XLS format).

## BOM Explosion Behavior
- Materials on the selection screen = Level 0.
- Full multilevel/recursive explosion downward from Level 0.
- Each Level 0 material's exploded components get their own dedicated section in the output — no mixing across Level 0 materials.
- Reference report for selection/program logic pattern: `/SIE/EVN_ZPEA_BOM_DOWNLOAD`.

## Output XLSX Field List (source doc naming, field / description / data type / determination rule)
| Field | Description | Data type | Determination rule / Source |
|---|---|---|---|
| Z_TCLEVEL | TC Level | CHAR(5) | Level 0 -> 0, Level 1 -> 1, ... Level x -> x |
| Z_TCOBTYPE | TC Object Type | CHAR(13) | See "TC Object Type determination logic" below |
| Z_YYBCEZNDR | Siemens Product Number | CHAR(25) | MARA-YYBCEZNDR |
| Z_YYBCNORM | Normbyte | CHAR(2) | MARA-YYBCNORM |
| Z_POSNR | Position Number | CHAR(4) | STPO-POSNR (no leading zeros) |
| Z_IDNRK | Component Number | CHAR(18) | STPO-IDNRK |
| Z_MAKTX | Material description | CHAR(40) | MARA-MAKTX |
| Z_SORTF | Sort String | CHAR(10) | STPO-SORTF |
| Z_TEXTH | BOM header text | CHAR(100) | All text lines incl. BOM alternative text, from STZU-ZTEXT and STXH (header & position long texts); stacked in same cell; DE language |
| Z_BEZWISS | Object dependencies | CHAR(50) | Multi-step: STPO-KNOBJ (highest STPO-STPOZ per STPO-STVKN, excluding POSTP="T") -> CUOB-KNNUM -> FM `CUKD_GET_KNOWLEDGE` |
| Z_TEXTP | Position BOM text | CHAR(100) | STPO-POTX1/POTX2 and STXH; stacked in same cell; DE language |
| Z_MENGE | Component Qty | QUAN(13) Dec 3 | STPO-MENGE |
| Z_MEINS | Component UoM | UNIT(3) | STPO-MEINS |
| Z_POSTP | Item category | CHAR(1) | STPO-POSTP |
| Z_SANKA | Costing relevancy indicator | CHAR(1) | STPO-SANKA |
| Z_STLST | BOM Status | NUMC(2) | STKO-STLST |
| Z_MSTAT | Plant-specific material status | — | For BOM header + components where STPO-POSTP="L": MARC-PSTAT where WERKS=3100 |

### TC Object Type (Z_TCOBTYPE) determination logic
Sequential criteria check per SAP number of BOM header/position:
1. If STPO-POSTP="T" (or STKO-STLTY="T") -> `E4_TextLine`; else go to 2.
2. If material begins with "P*" -> go to 4; else go to 3.
3. If material's class is "EL*" or "ME*" -> `E4_EDAComPart`; else -> `E4_ASM_PRT`.
4. If material has stock -> `E4_EDAComPart`; else go to 5.
5. If material's class is "EL*" or "ME*" -> `E4_EDAComPart`; else -> `E4_Software`.

Class lookup path (from reviewer comment): INOB (by OBJEK, KLART='001') -> CUOBJ -> KSSK -> CLINT -> KLAH (KLART='001') -> KLAH-CLASS.

Reviewer comments on eligibility / open items (Daniel Proteasa):
- "Mapping Values still need to be finally confirmed by Siemens! However this should not affect the effort estimation."
- Eligible materials per one criterion: BOM header/positions beginning with "P*" where STPO-POSTP ≠ "T" and MARA-MTART = ZVIB.
- "In case of BOM headers this criterion value has no relevance!" / "In case of BOM headers only this criterion value has relevance!" (context-dependent notes on specific criteria — needs re-confirmation with business during Functional Spec).
- Text retrieval: FM `READ_TEXT` or `CSAP_MAT_BOM_READ` suggested, referencing `/SIE/EVN_ZPEA_BOM_DOWNLOAD` for pattern.

## Naming Conventions (source doc)
- Report: `/SIE/EVN_ZPEA_BOM_EXP` — "Ausleitung der Stückliste als Excel" / "BOM export as Excel"
- T-code: `/SIE/EVN_BOM_EXPORT` — same description
- Output file name pattern: `Year_month_day` based (e.g. `xxxx_xx_xx.xlsx`)

## Technical Steps (source doc, for /TechnicalSpec reference only)
1. Create report `/SIE/EVN_ZPEA_BOM_EXP` with a selection screen.
2. Selection screen: Material, Plant, Date, plus local/application-server output choice.
3. Create a new Logical Path pointing to the physical Application Server path.
4. Call FM `CS_BOM_EXPL_MAT_V2` to perform BOM explosion.
5. Prepare Excel file from the explosion result.
6. Output: `GUI_DOWNLOAD` for local, `OPEN DATASET` for application server.
7. Note: export all output files with at least header data even if no content exists.

## Language / Translation
- No language considerations noted; no translation requirements (English-only development); some texts explicitly sourced in DE language per field rules above.

## Open items flagged in source document (carry forward)
- Technical section author/details still placeholder ("xxx") in source doc.
- TC Object Type mapping values pending final confirmation by Siemens (business).
- Some criterion applicability notes (header vs. position relevance) need re-confirmation.
- XLS as a fallback format "just in case XLSX is not possible" — to be confirmed as in/out of scope.

---
Full raw text extraction (paragraphs/tables, in document order) is preserved at `raw_extract.txt` in this same folder for completeness.
