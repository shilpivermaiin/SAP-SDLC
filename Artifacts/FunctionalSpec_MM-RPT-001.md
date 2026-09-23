# Functional Specification

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | MM-RPT-001 |
| Object Name | Material Summary Application |
| RICEFW Type | Report |
| Linked BRD Ref | [BRD_MaterialSummaryReport.md](BRD_MaterialSummaryReport.md) |
| Linked Solution Architect Ref | [SolutionArchitect_MaterialSummaryReport.md](SolutionArchitect_MaterialSummaryReport.md) |
| Author | shilpiverma.iin@gmail.com (Architect profile, AI-assisted) |
| Version | 1.0 |
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-09-23 | shilpiverma.iin@gmail.com | Initial creation | Draft |
| 1.0 | 2026-09-23 | shilpiverma.iin@gmail.com | Frozen after freeze confirmation | Frozen |

## 2. Business Process Overview
Plant and Warehouse Operations users currently open several transactions to build a basic profile of a material (type, group, description, base unit of measure, status). This object gives them one interactive screen listing these attributes for every material in every plant, which they can narrow with optional filters and then search, sort, and filter further on screen. Entry criteria: BRD approved; reuse/gap assessed in the Solution Architect phase (custom build decided — no standard single-screen equivalent); design owner shilpiverma.iin@gmail.com.

## 2a. Business Impact & Affected Users
- **Affected users:** Plant/Warehouse Operations (primary consumers); Materials Management team (business owner).
- **Impact if not delivered:** continued manual multi-transaction lookups, time lost, and risk of using inconsistent/outdated material information.
- **Change management:** short user communication/quick-reference on the new transaction; Security team adds the transaction to the Plant/Warehouse Operations role. No process change — read-only tool.

## 3. Object Type & Purpose
**Report** (interactive, display-only). Presents a searchable, filterable list of material master attributes per material and plant. No data is created, changed, or exported.

## 4. Trigger / Entry Point
User-initiated, on demand: the user starts the new custom transaction in SAP GUI. No background/scheduled execution.

## 5. Input Specification
All selection fields are optional ranges (single values, multiple values, intervals, exclusions); leaving everything blank returns all materials in all plants.

| Field | Mandatory? | Source | Default Value |
|---|---|---|---|
| Material Number | No | Manual entry / standard search help | Blank (all) |
| Plant | No | Manual entry / standard search help | Blank (all) |
| Material Type | No | Manual entry / standard search help | Blank (all) |
| Material Group | No | Manual entry / standard search help | Blank (all) |
| Cross-plant Material Status | No | Manual entry / standard search help | Blank (all) |
| Plant-specific Material Status | No | Manual entry / standard search help | Blank (all) |
| Include materials flagged for deletion | No (checkbox) | Manual | Unchecked |

## 6. Business Rules / Processing Logic
| # | Rule Type | Business Rule | Condition | Result / Action on Fail |
|---|---|---|---|---|
| 1 | Derivation | Output granularity is one row per material per plant | Material exists in a plant | One row per material–plant combination |
| 2 | Validation | ⚠️ Only materials extended to at least one plant are shown (Assumed — confirmed at freeze) | Material has no plant record | Material not shown (no message) |
| 3 | Validation | Selection restrictions are applied as entered | Row doesn't match an entered range | Row not shown |
| 4 | Validation | Materials flagged for deletion are excluded by default | Checkbox unchecked AND (material flagged for deletion at client level OR plant record flagged for deletion) — ⚠️ Assumed "either level" (confirmed at freeze) | Row not shown; when checkbox checked, row shown |
| 5 | Derivation | Description is shown in the user's logon language | ⚠️ No description maintained in logon language (Assumed — confirmed at freeze) | Description column left blank; row still shown |
| 6 | Derivation | Both statuses are shown side by side | Always | Cross-plant status from the material; plant-specific status from the material's plant record (either may be blank) |
| 7 | Validation | Entered plant / material type / material group values must exist | Entered single value not found in SAP | Error — processing stops, user stays on selection screen |
| 8 | Validation | Export/download is not permitted (BRD out of scope) | Always | Export, download to local file/spreadsheet, and send functions are not offered on the output screen |
| 9 | Validation | Result must not be empty | No row matches the selection | Information message — user stays on selection screen |

## 6a. Reference Objects (Standard SAP)
| Object Type | Object Name | Purpose in this process |
|---|---|---|
| Table | MARA | General material data (type, group, base UoM, cross-plant status, client-level deletion flag) |
| Table | MARC | Plant data for material (plant, plant-specific status, plant-level deletion flag) |
| Table | MAKT | Material descriptions (per language) |
| Transaction | MM03 | Reference — display material master |

## 6b. SAP Data Mapping

**Master Table Join Conditions**
| Master Table (Business Name) | Technical Table Name | Business Purpose | Joins To | Join Condition (Business Key) | Technical Join Fields | Cardinality |
|---|---|---|---|---|---|---|
| General Material Data | MARA | Client-level material attributes | Plant Data for Material (MARC) | Same Material Number | MARA-MATNR = MARC-MATNR | 1 : n (inner — rows only where plant data exists) |
| Material Descriptions | MAKT | Description text | General Material Data (MARA) | Same Material Number and user's logon language | MAKT-MATNR = MARA-MATNR, MAKT-SPRAS = logon language | 1 : 0..1 (outer — description optional) |

**Field-Level Data Mapping**
| Output Column | Source Table (Business Name) | Technical Table Name | Source Field (Business Name) | Technical Field Name | Header/Item Level | Derivation Rule |
|---|---|---|---|---|---|---|
| Material | General Material Data | MARA | Material Number | MATNR | Material | Displayed in external format |
| Description | Material Descriptions | MAKT | Material Description | MAKTX | Material | Logon language (Rule 5) |
| Plant | Plant Data for Material | MARC | Plant | WERKS | Plant | — |
| Material Type | General Material Data | MARA | Material Type | MTART | Material | — |
| Material Group | General Material Data | MARA | Material Group | MATKL | Material | — |
| Base UoM | General Material Data | MARA | Base Unit of Measure | MEINS | Material | Displayed in external (language-dependent) format |
| Cross-plant Status | General Material Data | MARA | Cross-Plant Material Status | MSTAE | Material | Blank if not set |
| Plant-specific Status | Plant Data for Material | MARC | Plant-Specific Material Status | MMSTA | Plant | Blank if not set |

Deletion flags used for Rule 4 (filter only, not displayed): MARA-LVORM (client level), MARC-LVORM (plant level).

## 7. Output Specification

**Screen-by-Screen Navigation**
1. **Selection screen** — user starts the transaction; the fields in Section 5 are shown, all blank, checkbox unchecked. User may save/load selection variants (standard).
2. **Execute** — rules 7 and 9 are checked. On error/no data, a message is shown and the user stays on the selection screen with entries preserved.
3. **Result grid** — the interactive list with the columns below. Users can search, sort, filter, hide/reorder columns, and save personal layouts. Export/download/send functions are not available (Rule 8). The number of rows found is shown.
4. **Back** — returns to the selection screen with entries preserved; Exit leaves the transaction.

**Exact Columns/Fields Displayed (per screen)**
| Screen | Column/Field | Display Order | Sort/Grouping |
|---|---|---|---|
| Result grid | Material | 1 | Default sort 1 (ascending) |
| Result grid | Description | 2 | — |
| Result grid | Plant | 3 | Default sort 2 (ascending) |
| Result grid | Material Type | 4 | — |
| Result grid | Material Group | 5 | — |
| Result grid | Base UoM | 6 | — |
| Result grid | Cross-plant Status | 7 | — |
| Result grid | Plant-specific Status | 8 | — |

No totals or subtotals.

## 8. Error Handling & Messages
| # | Potential Error | Error Type | Notification Strategy | Notify Whom | Error Report Needed? |
|---|---|---|---|---|---|
| 1 | No materials match the selection | Warning (information) | On-screen message | Executing user | No |
| 2 | Entered plant does not exist | Error | On-screen message, stay on selection screen | Executing user | No |
| 3 | Entered material type does not exist | Error | On-screen message, stay on selection screen | Executing user | No |
| 4 | Entered material group does not exist | Error | On-screen message, stay on selection screen | Executing user | No |
| 5 | User not authorized to start the transaction | Error | Standard SAP authorization message | Executing user (requests access via standard process) | No |

## 8a. Error Reports Required
None.

## 9. Authorization Requirements
- Access controlled only by authorization to start the new transaction (assigned to the Plant/Warehouse Operations role).
- No plant, material-type, or other organizational restriction — authorized users see all plants and materials (confirmed in Solution Architect phase).
- Display only — no create/change authorization involved.

## 10. Assumptions, Dependencies & Technical Spec Input Notes
- ⚠️ Materials without any plant record are not shown (confirmed at freeze).
- ⚠️ "Flagged for deletion" = client-level OR plant-level flag (confirmed at freeze).
- ⚠️ Description in logon language; blank when not maintained (confirmed at freeze).
- Dependency: Security team to add the transaction to the Plant/Warehouse Operations role.
- Data privacy: material master only — no personal data involved.
- Once frozen, further changes require an approved scope change request.

### Configuration Commitments Tracker
| Configuration Item | Commitment/Decision | Owner | Milestone Impact |
|---|---|---|---|
| None | No configuration changes required | — | None |

### Technical Spec Input Notes
- Mechanism for suppressing grid export/download/send functions (Rule 8) — build decision for `/TechnicalSpec`.
- Row volume: material × plant can exceed the < 50k material count — consider a maximum-hits safeguard or other performance measure.
- Validation of entered values (Rule 7) against the standard check tables — technical approach for `/TechnicalSpec`.

## 11. Test Scenarios (UAT-level)
| # | Scenario | Type | Expected Result |
|---|---|---|---|
| 1 | Run with no selection | Positive | All non-deleted material–plant rows shown, 8 columns in the defined order, sorted by Material then Plant |
| 2 | Run for a single plant | Positive | Only rows for that plant shown |
| 3 | Run for a material type and material group | Positive | Only matching rows shown |
| 4 | Run with "Include materials flagged for deletion" checked | Positive | Deletion-flagged rows (client or plant level) now included |
| 5 | Run for a selection with no matching materials | Negative | Information message; user stays on selection screen |
| 6 | Enter a non-existent plant | Negative | Error message; user stays on selection screen |
| 7 | Look for export/download on the result grid | Negative | No export/download/send function available |

### Test Data Requirements
| Data Needed | Master/Transactional | Owner | Required By |
|---|---|---|---|
| Materials extended to 2+ plants, with differing plant-specific statuses | Master | Materials Management team | Before component test |
| Material with client-level deletion flag; material with plant-level deletion flag only | Master | Materials Management team | Before component test |
| Material without a description in a test user's logon language | Master | Materials Management team | Before component test |

---
**Next step:** Run `/TechnicalSpec` referencing this document (Object ID: MM-RPT-001) to generate the Technical Specification.
