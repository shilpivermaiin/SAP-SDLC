# Functional Specification

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | MM-RPT-002 |
| Object Name | Multilevel BOM Excel Export Report |
| RICEFW Type | Report |
| Linked BRD Ref | BRD_MultilevelBOMExcelExport.md |
| Linked Solution Architect Ref | SolutionArchitect_MultilevelBOMExcelExport.md |
| Author | SAP-SDLC (AI-assisted, Technical Consultant/Developer profile) |
| Version | 1.0 |

### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-09-17 | shilpiverma.iin@gmail.com | Initial creation | Draft |

## 2. Business Process Overview
This report supports the Production Planning and Engineering BOM data extraction process. It lets an authorized user select a single material at a specific plant and validity date, automatically explode that material's Bill of Materials recursively through every subordinate level, and export the resulting header and component data to Excel — either to a shared application-server location or downloaded to the user's own machine. The report is run on-demand; there is no scheduled/background execution in scope. Standard SAP BOM explosion functionality is reused for the recursive explosion itself; the custom development covers the output field derivation, classification logic, and dual output-destination handling.

## 2a. Business Impact & Affected Users
- **Affected roles**: Production Planners / MRP Controllers, Engineering / PLM team (per BRD stakeholders).
- **Business impact if not delivered**: these teams continue manually re-compiling multilevel BOM data screen-by-screen into Excel — a slow, repetitive, and error-prone process, particularly for materials with many BOM levels.
- **Change management**: minimal — this is a net-new, standalone report with no changes to existing transactions; end-user training is limited to how to run the new transaction and use the two output-destination options.

## 3. Object Type & Purpose
- **Object Type**: Report (custom, on-demand, selection-screen driven)
- **Purpose**: Export a single material's fully exploded multilevel BOM (header + components) to Excel, in a fixed field structure, to a location chosen by the user.

## 4. Trigger / Entry Point
User manually starts the report via its transaction code. Execution is on-demand only — no background job/scheduling variant is in scope.

## 5. Input Specification
| Field | Mandatory? | Source | Default Value |
|---|---|---|---|
| Material Number | Mandatory | Manual entry by user | None |
| Plant | Mandatory | Manual entry by user | None |
| Valid-From Date | Mandatory | Manual entry by user | Today's date (system date); user can override |
| Output Destination (Application Server / Local File) | Mandatory | User selection between two options | None |
| Logical Path (when Application Server selected) | Mandatory when Application Server chosen | Selected from predefined logical path configuration | None |
| Local save location (when Local File selected) | Mandatory when Local File chosen | User selects via standard file save dialog; file name auto-proposed using the standard naming convention | Auto-proposed file name |

## 6. Business Rules / Processing Logic
| # | Rule Type | Business Rule | Condition | Result / Action on Fail |
|---|---|---|---|---|
| 1 | Validation | Material/Plant/Valid-From combination must resolve to an existing BOM | No BOM found for the entered combination | Error — on-screen message, no output produced, run stops |
| 2 | Derivation | BOM level numbering | Always | Level 0 = the entered material; each subsequent explosion level numbered sequentially (1, 2, 3, …) |
| 3 | Calculation | Multilevel BOM explosion | BOM exists | Recursively explode the BOM from Level 0 down through every existing subordinate level, for the single entered material/plant/date |
| 4 | Business Rule | Header-only output when no components exist | BOM header exists but has zero exploded components | Export the BOM header data only; this is not treated as an error |
| 5 | Derivation | Teamcenter Object Type classification — Step 1 | Item category = Text ("T") | Classify as Text Line |
| 6 | Derivation | Teamcenter Object Type classification — Step 2 | Step 1 not met; material number begins with "P" | Proceed to Step 4 check |
| 7 | Derivation | Teamcenter Object Type classification — Step 2 (alt.) | Step 1 not met; material number does not begin with "P" | Proceed to Step 3 check |
| 8 | Derivation | Teamcenter Object Type classification — Step 3 | Material belongs to a relevant electrical/mechanical class | Classify as Component Part |
| 9 | Derivation | Teamcenter Object Type classification — Step 3 (alt.) | Material does not belong to a relevant electrical/mechanical class | Classify as Assembly Part |
| 10 | Derivation | Teamcenter Object Type classification — Step 4 | Material has on-hand stock | Classify as Component Part |
| 11 | Derivation | Teamcenter Object Type classification — Step 5 | Material has no stock; belongs to a relevant electrical/mechanical class | Classify as Component Part |
| 12 | Derivation | Teamcenter Object Type classification — Step 5 (alt.) | Material has no stock; does not belong to a relevant electrical/mechanical class | Classify as Software |
| 13 | Business Rule | Long-text handling for BOM header and position text | Text lines exist, including alternative BOM text variants | Include every text line found, stacked in the same output cell; source text in German language |
| 14 | Business Rule | Object dependency lookup | Component is not a text-line item | Retrieve associated object dependency information via the standard multi-step lookup path |
| 15 | Formatting | Position Number formatting | Always | Remove any leading zeroes from the position number in the output |
| 16 | Business Rule | Plant-specific material status | BOM header, and components flagged as text-relevant by item category | Retrieve and display the plant-specific material status for the entered plant |

> ⚠️ The classification values used in rules 5–12 are noted in the source specification as still pending final confirmation by the business — see Section 10.

## 6a. Reference Objects (Standard SAP)
| Object Type | Object Name | Purpose in this process |
|---|---|---|
| Table | MARA | Material master — description, cross-reference numbers, material type |
| Table | STPO | BOM item (component) data — position, component, quantities, item category, costing relevance, sort string, position texts |
| Table | STKO | BOM header data — BOM status |
| Table | MARC | Plant-specific material data — plant material status |
| Table | STZU | BOM header additional text |
| Table | STXH | Header & position long text index |
| Table | INOB | Object-to-classification link |
| Table | KSSK | Classification: object-to-class assignment |
| Table | KLAH | Class header data |
| Table | CUOB | Object dependency link table |
| BAPI/FM | CS_BOM_EXPL_MAT_V2 | Standard multilevel BOM explosion by material |
| BAPI/FM | CUKD_GET_KNOWLEDGE | Retrieve object dependency knowledge |
| BAPI/FM | READ_TEXT / CSAP_MAT_BOM_READ | Retrieve long text content |

## 6b. SAP Data Mapping

**Master Table Join Conditions**
| Master Table (Business Name) | Technical Table Name | Business Purpose | Joins To | Join Condition (Business Key) | Technical Join Fields | Cardinality |
|---|---|---|---|---|---|---|
| Material Master | MARA | Material description & attributes | BOM Item | Same Material Number | MARA-MATNR = STPO-IDNRK | 1:N |
| BOM Header | STKO | BOM header status | BOM Item | Same BOM internal record | STKO-STLNR = STPO-STLNR | 1:N |
| BOM Item | STPO | Component-level data | Plant-Specific Material Data | Same Material Number and Plant | STPO-IDNRK = MARC-MATNR, entered Plant = MARC-WERKS | 1:1 |
| Object Classification Link | INOB | Links material to classification | Classification Assignment | Same Object/Classification key | INOB-CUOBJ = KSSK-CLINT | 1:N |
| Classification Assignment | KSSK | Links object to class | Class Header | Same Class internal ID | KSSK-CLINT = KLAH-CLINT | N:1 |

**Field-Level Data Mapping**
| Output Column | Source Table (Business Name) | Technical Table Name | Source Field (Business Name) | Technical Field Name | Header/Item Level | Derivation Rule |
|---|---|---|---|---|---|---|
| BOM Level | — (derived) | — | — | — | Both | Level 0 = selected material; incremented by 1 per explosion level (Rule 2) |
| Teamcenter Object Type | Material/BOM Item/Classification | MARA / STPO / KLAH | Item category, Material Number pattern, Material Class, Stock | STPO-POSTP, MATNR, KLAH-CLASS, stock quantity | Item | Per classification Rules 5–12 |
| Siemens Product Number | Material Master | MARA | Siemens Product Number | YYBCEZNDR | Header/Item | Direct read |
| Normbyte | Material Master | MARA | Normbyte | YYBCNORM | Header/Item | Direct read |
| Position Number | BOM Item | STPO | Position Number | POSNR | Item | Direct read, leading zeroes removed (Rule 15) |
| Component Number | BOM Item | STPO | Component Number | IDNRK | Item | Direct read |
| Material Description | Material Master | MARA | Material Description | MAKTX | Header/Item | Direct read |
| Sort String | BOM Item | STPO | Sort String | SORTF | Item | Direct read |
| BOM Header Text | BOM Header Text / Long Text | STZU / STXH | BOM Header Text | Text content | Header | All text lines incl. alternative BOM text, stacked in same cell, German language (Rule 13) |
| Object Dependencies | Object Dependency Lookup | STPO / CUOB (via FM) | Object Dependency | Dependency knowledge | Item | Multi-step lookup (Rule 14) |
| Position BOM Text | BOM Item / Long Text | STPO / STXH | Position Text | Text content | Item | All text lines, stacked in same cell, German language (Rule 13) |
| Component Quantity | BOM Item | STPO | Component Quantity | MENGE | Item | Direct read |
| Component Unit of Measure | BOM Item | STPO | Component UoM | MEINS | Item | Direct read |
| Item Category | BOM Item | STPO | Item Category | POSTP | Item | Direct read |
| Costing Relevancy Indicator | BOM Item | STPO | Costing Relevancy | SANKA | Item | Direct read |
| BOM Status | BOM Header | STKO | BOM Status | STLST | Header | Direct read |
| Plant-Specific Material Status | Plant Material Data | MARC | Plant Material Status | PSTAT | Header/Item (text-relevant items only) | Direct read, restricted to entered plant (Rule 16) |

## 7. Output Specification

**Screen-by-Screen Navigation**
1. User launches the transaction; the selection screen appears with: Material Number, Plant, Valid-From Date (defaulted to today), and Output Destination choice (Application Server / Local File), plus a Logical Path selection field shown when Application Server is chosen.
2. User enters/confirms values and executes the report.
3. System validates the Material/Plant/Valid-From combination:
   - If invalid or no BOM found → an on-screen error message is shown; no output is produced; the user remains on the selection screen.
   - If valid → processing proceeds to explosion and export.
4. System performs the multilevel BOM explosion and builds the output dataset per the Business Rules and Data Mapping above.
5. Depending on the output destination chosen:
   - **Application Server**: the system writes the file directly to the configured logical path; an on-screen confirmation message shows the resulting file name/path.
   - **Local File**: the standard file save dialog appears with the file name pre-populated per the standard naming convention; the user confirms or adjusts the save location and saves.
6. The run completes; the user returns to the selection screen.

**Exact Columns/Fields Displayed**
| Screen | Column/Field | Display Order | Sort/Grouping |
|---|---|---|---|
| Excel Output | BOM Level | 1 | Grouped under the single Level 0 material for the run; sorted by ascending level, then by position within level |
| Excel Output | Teamcenter Object Type | 2 | — |
| Excel Output | Siemens Product Number | 3 | — |
| Excel Output | Normbyte | 4 | — |
| Excel Output | Position Number | 5 | — |
| Excel Output | Component Number | 6 | — |
| Excel Output | Material Description | 7 | — |
| Excel Output | Sort String | 8 | — |
| Excel Output | BOM Header Text | 9 | — |
| Excel Output | Object Dependencies | 10 | — |
| Excel Output | Position BOM Text | 11 | — |
| Excel Output | Component Quantity | 12 | — |
| Excel Output | Component Unit of Measure | 13 | — |
| Excel Output | Item Category | 14 | — |
| Excel Output | Costing Relevancy Indicator | 15 | — |
| Excel Output | BOM Status | 16 | — |
| Excel Output | Plant-Specific Material Status | 17 | — |

## 8. Error Handling & Messages
| # | Potential Error | Error Type | Notification Strategy | Notify Whom | Error Report Needed? |
|---|---|---|---|---|---|
| 1 | Material/Plant/Valid-From combination has no BOM | Error | On-screen message | End user running the report | No |
| 2 | Material does not exist | Error | On-screen message | End user | No |
| 3 | Plant does not exist / invalid | Error | On-screen message | End user | No |
| 4 | BOM exists but has zero components | Warning | On-screen informational message; header-only output still produced | End user | No |
| 5 | Application Server logical path not configured/accessible | Fatal | On-screen message; run aborts | End user (escalate to Basis if persistent) | No |
| 6 | Local save fails (e.g. permission/disk issue) | Error | Standard SAP file-save error dialog | End user | No |

## 8a. Error Reports Required
None — all errors are handled via on-screen messages only, per the confirmed notification strategy.

## 9. Authorization Requirements
- Standard transaction-code authorization only — no additional plant-level or other restriction beyond who can execute the transaction (confirmed).
- Intended user roles: Production Planners / MRP Controllers, Engineering / PLM team (per BRD).

## 10. Assumptions, Dependencies & Technical Spec Input Notes

### Configuration Commitments Tracker
| Configuration Item | Commitment/Decision | Owner | Milestone Impact |
|---|---|---|---|
| Logical File Path (Application Server) | New logical path/logical file name must be configured, pointing to the physical application-server directory | Basis team | Blocks build/testing of the Application Server output option until configured |

### Technical Spec Input Notes
- An existing custom report at this client was identified during Solution Architect as a design-pattern reference for the selection screen and explosion logic (named in the source reference document, not repeated here) — `/TechnicalSpec` should consult it.
- The source reference document proposes a specific file-naming convention (year_month_day based) — `/TechnicalSpec` to finalize the exact naming pattern and technical output field structure.
- The source reference document's custom field-naming convention (its own Z-prefixed structure field names) is a technical design decision for `/TechnicalSpec` to define; not carried into this FS.
- Output classification (Teamcenter Object Type) mapping values are noted in the source document as still pending final confirmation by the business — carried forward from the BRD; must be resolved before or during Technical Spec/Code, or re-validated in Testing.
- SLA/performance expectation: not conclusively specified during this session — assumed no hard SLA target; standard/moderate volumes as already confirmed in the Solution Architect write-up.
- Design owner for this Functional Spec is pending confirmation.

## 11. Test Scenarios (UAT-level)
| # | Scenario | Type (Positive/Negative) | Expected Result |
|---|---|---|---|
| 1 | Run report for a material/plant/date with a valid multilevel BOM (3+ levels) | Positive | Output produced with correct header + all levels/components, each properly derived per Section 6, no mixing across levels |
| 2 | Run report for a material/plant/date with a valid BOM header but zero components | Positive | Output produced with header data only; no error |
| 3 | Run report choosing Application Server as output destination | Positive | File written to the configured logical path with correct naming convention; on-screen confirmation shown |
| 4 | Run report choosing Local File as output destination | Positive | Standard save dialog appears with correct auto-proposed file name; file saved to user-selected location |
| 5 | Run report for a material/plant/date combination with no BOM | Negative | On-screen error message shown; no output file produced |
| 6 | Run report for a non-existent material or invalid plant | Negative | On-screen error message shown; no output file produced |

### Test Data Requirements
| Data Needed | Master/Transactional | Owner | Required By |
|---|---|---|---|
| Material with multilevel BOM (3+ levels), valid plant | Master + Transactional | Functional/Business team | Component test execution |
| Material with BOM header but no components | Master + Transactional | Functional/Business team | Component test execution |
| Non-existent material / invalid plant values | N/A (negative test) | Test team | Component test execution |

---
**Next step:** Run `/TechnicalSpec` referencing this document (Object ID: MM-RPT-002) to generate the Technical Specification.
