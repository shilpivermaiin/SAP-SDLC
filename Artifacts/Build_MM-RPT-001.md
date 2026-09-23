# Build & Unit Test Record

> ⚠️ **EXECUTION PENDING — NO LIVE SAP CONNECTION.** No SAP system connector (ADT/`SAPWrite`/`SAPActivate`/`SAPDiagnose`/`SAPTransport`) was attached to the session that produced this record. Everything below is the complete, ready-to-execute build per the frozen Technical Spec — full source, message class, text elements, transport, and execution steps. **No object has been created, activated, unit-tested, ATC-checked, or transported yet, and no result in this document is claimed as executed.** Every "Result" cell reads *Pending execution* until the build is run in SAP DEV.

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | MM-RPT-001 |
| Object Name | Material Summary Application (`ZMM_MAT_SUMMARY`) |
| Linked Technical Spec Ref | [TechnicalSpec_MM-RPT-001.md](TechnicalSpec_MM-RPT-001.md) |
| Linked Functional Spec Ref | [FunctionalSpec_MM-RPT-001.md](FunctionalSpec_MM-RPT-001.md) |
| Developer | SAP-SDLC (AI-assisted) for shilpiverma.iin@gmail.com |
| Version | 1.0 |
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-09-23 | shilpiverma.iin@gmail.com | Initial creation — build package prepared; SAP execution pending live connection | Draft |

## 2. Development Environment & Transport
| Item | Value |
|---|---|
| DEV Client | ⚠️ To be confirmed at execution (S/4HANA on-premise DEV) |
| Package | `ZMM_MATSUM` (new) |
| Workbench Request (single) | ⚠️ To be created at execution — description `MM-RPT-001 Material Summary Application` (check first for an existing open request with "MM-RPT-001" and reuse it) |
| Customizing Request (single, if applicable) | Not applicable — no configuration (TS §10a) |

## 3. Objects Built
| Seq | Object Type | Object Name | Status | Deviation from TS? |
|---|---|---|---|---|
| 1 | Development Package | `ZMM_MATSUM` | ⬜ Pending execution | None |
| 2 | Message Class | `ZMM_MAT_SUMMARY` (msgs 001–006, §3a) | ⬜ Pending execution | None |
| 3 | Program (executable) | `ZMM_MAT_SUMMARY` (source §3b, text elements §3c) | ⬜ Pending execution | None |
| 4 | Transaction (report transaction) | `ZMM001` → program `ZMM_MAT_SUMMARY`, screen 1000, GUI support: SAP GUI for HTML/Windows | ⬜ Pending execution | None |

### 3a. Message Class `ZMM_MAT_SUMMARY` (short text: "MM-RPT-001 Material Summary")
| No. | Text |
|---|---|
| 001 | Plant &1 does not exist |
| 002 | Material type &1 does not exist |
| 003 | Material group &1 does not exist |
| 004 | No materials found for the selection criteria |
| 005 | You are not authorized to use transaction &1 |
| 006 | &1 material/plant rows selected |

### 3b. Program `ZMM_MAT_SUMMARY` — full source

```abap
*&---------------------------------------------------------------------*
*& Report ZMM_MAT_SUMMARY
*&---------------------------------------------------------------------*
*& Object ID : MM-RPT-001 - Material Summary Application
*& Spec      : TechnicalSpec_MM-RPT-001.md / FunctionalSpec_MM-RPT-001.md
*& Purpose   : Display-only list of material x plant master attributes
*&             (description, type, group, base UoM, cross-plant and
*&             plant-specific status) in an ALV grid without export.
*& Transaction: ZMM001
*&---------------------------------------------------------------------*
REPORT zmm_mat_summary MESSAGE-ID zmm_mat_summary.

*----------------------------------------------------------------------*
* Types
*----------------------------------------------------------------------*
TYPES:
  " Output row - field order = column order (FS section 7)
  BEGIN OF ty_output,
    matnr TYPE mara-matnr,
    maktx TYPE makt-maktx,
    werks TYPE marc-werks,
    mtart TYPE mara-mtart,
    matkl TYPE mara-matkl,
    meins TYPE mara-meins,
    mstae TYPE mara-mstae,
    mmsta TYPE marc-mmsta,
  END OF ty_output,
  ty_output_tab   TYPE STANDARD TABLE OF ty_output WITH EMPTY KEY,
  ty_matnr_range  TYPE RANGE OF mara-matnr,
  ty_werks_range  TYPE RANGE OF marc-werks,
  ty_mtart_range  TYPE RANGE OF mara-mtart,
  ty_matkl_range  TYPE RANGE OF mara-matkl,
  ty_mstae_range  TYPE RANGE OF mara-mstae,
  ty_mmsta_range  TYPE RANGE OF marc-mmsta.

*----------------------------------------------------------------------*
* Selection screen (FS section 5) - all criteria optional
*----------------------------------------------------------------------*
DATA:
  gv_matnr TYPE mara-matnr,
  gv_werks TYPE marc-werks,
  gv_mtart TYPE mara-mtart,
  gv_matkl TYPE mara-matkl,
  gv_mstae TYPE mara-mstae,
  gv_mmsta TYPE marc-mmsta.

SELECTION-SCREEN BEGIN OF BLOCK b01 WITH FRAME TITLE TEXT-b01.
  SELECT-OPTIONS:
    s_matnr FOR gv_matnr,
    s_werks FOR gv_werks,
    s_mtart FOR gv_mtart,
    s_matkl FOR gv_matkl,
    s_mstae FOR gv_mstae,
    s_mmsta FOR gv_mmsta.
SELECTION-SCREEN END OF BLOCK b01.

SELECTION-SCREEN BEGIN OF BLOCK b02 WITH FRAME TITLE TEXT-b02.
  PARAMETERS p_del AS CHECKBOX DEFAULT space.   " Include deletion-flagged
SELECTION-SCREEN END OF BLOCK b02.

*----------------------------------------------------------------------*
* CLASS lcl_selection_validator - FS Rule 7
*----------------------------------------------------------------------*
CLASS lcl_selection_validator DEFINITION FINAL.
  PUBLIC SECTION.
    TYPES:
      BEGIN OF ty_error,
        msgno TYPE symsgno,
        value TYPE symsgv,
      END OF ty_error.

    "! Checks entered single values (I/EQ) against their check tables.
    "! Returns the first error found; initial if all values exist.
    METHODS validate
      IMPORTING ir_werks        TYPE ty_werks_range OPTIONAL
                ir_mtart        TYPE ty_mtart_range OPTIONAL
                ir_matkl        TYPE ty_matkl_range OPTIONAL
      RETURNING VALUE(rs_error) TYPE ty_error.
ENDCLASS.

CLASS lcl_selection_validator IMPLEMENTATION.
  METHOD validate.
    DATA lv_exists TYPE abap_bool.

    LOOP AT ir_werks INTO DATA(ls_werks) WHERE sign = 'I' AND option = 'EQ'.
      CLEAR lv_exists.
      SELECT SINGLE @abap_true FROM t001w
        WHERE werks = @ls_werks-low
        INTO @lv_exists.
      IF lv_exists = abap_false.
        rs_error = VALUE #( msgno = '001' value = ls_werks-low ).
        RETURN.
      ENDIF.
    ENDLOOP.

    LOOP AT ir_mtart INTO DATA(ls_mtart) WHERE sign = 'I' AND option = 'EQ'.
      CLEAR lv_exists.
      SELECT SINGLE @abap_true FROM t134
        WHERE mtart = @ls_mtart-low
        INTO @lv_exists.
      IF lv_exists = abap_false.
        rs_error = VALUE #( msgno = '002' value = ls_mtart-low ).
        RETURN.
      ENDIF.
    ENDLOOP.

    LOOP AT ir_matkl INTO DATA(ls_matkl) WHERE sign = 'I' AND option = 'EQ'.
      CLEAR lv_exists.
      SELECT SINGLE @abap_true FROM t023
        WHERE matkl = @ls_matkl-low
        INTO @lv_exists.
      IF lv_exists = abap_false.
        rs_error = VALUE #( msgno = '003' value = ls_matkl-low ).
        RETURN.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.

*----------------------------------------------------------------------*
* CLASS lcl_data_provider - FS Rules 1-6
*----------------------------------------------------------------------*
CLASS lcl_data_provider DEFINITION FINAL.
  PUBLIC SECTION.
    "! Reads one row per material x plant, applying all selection
    "! ranges; deletion-flagged rows (client or plant level) are
    "! excluded unless iv_incl_deleted = abap_true.
    METHODS get_rows
      IMPORTING ir_matnr         TYPE ty_matnr_range OPTIONAL
                ir_werks         TYPE ty_werks_range OPTIONAL
                ir_mtart         TYPE ty_mtart_range OPTIONAL
                ir_matkl         TYPE ty_matkl_range OPTIONAL
                ir_mstae         TYPE ty_mstae_range OPTIONAL
                ir_mmsta         TYPE ty_mmsta_range OPTIONAL
                iv_incl_deleted  TYPE abap_bool DEFAULT abap_false
      RETURNING VALUE(rt_output) TYPE ty_output_tab.
ENDCLASS.

CLASS lcl_data_provider IMPLEMENTATION.
  METHOD get_rows.
    " Rule 4: empty range = no restriction; 'I EQ space' = not flagged
    DATA lr_lvorm TYPE RANGE OF mara-lvorm.
    IF iv_incl_deleted = abap_false.
      lr_lvorm = VALUE #( ( sign = 'I' option = 'EQ' low = space ) ).
    ENDIF.

    " Rule 1/2: inner join MARC -> one row per plant, plant-less
    "           materials dropped
    " Rule 5:   outer join MAKT in logon language -> blank if missing
    " Rule 3/6: all ranges and both statuses in one statement
    SELECT mara~matnr,
           makt~maktx,
           marc~werks,
           mara~mtart,
           mara~matkl,
           mara~meins,
           mara~mstae,
           marc~mmsta
      FROM mara
      INNER JOIN marc
        ON marc~matnr = mara~matnr
      LEFT OUTER JOIN makt
        ON  makt~matnr = mara~matnr
        AND makt~spras = @sy-langu
      WHERE mara~matnr IN @ir_matnr
        AND marc~werks IN @ir_werks
        AND mara~mtart IN @ir_mtart
        AND mara~matkl IN @ir_matkl
        AND mara~mstae IN @ir_mstae
        AND marc~mmsta IN @ir_mmsta
        AND mara~lvorm IN @lr_lvorm
        AND marc~lvorm IN @lr_lvorm
      ORDER BY mara~matnr, marc~werks
      INTO TABLE @rt_output.
  ENDMETHOD.
ENDCLASS.

*----------------------------------------------------------------------*
* CLASS lcl_alv_view - FS Rule 8 and section 7
*----------------------------------------------------------------------*
CLASS lcl_alv_view DEFINITION FINAL.
  PUBLIC SECTION.
    METHODS display
      CHANGING ct_output TYPE ty_output_tab.

  PRIVATE SECTION.
    "! Hides every export/download/send/in-place-view function (Rule 8)
    METHODS hide_export_functions
      IMPORTING io_functions TYPE REF TO cl_salv_functions_list.
ENDCLASS.

CLASS lcl_alv_view IMPLEMENTATION.
  METHOD display.
    DATA lv_rows TYPE i.

    TRY.
        cl_salv_table=>factory(
          IMPORTING r_salv_table = DATA(lo_salv)
          CHANGING  t_table      = ct_output ).

        DATA(lo_functions) = lo_salv->get_functions( ).
        lo_functions->set_all( abap_true ).
        hide_export_functions( lo_functions ).

        lo_salv->get_columns( )->set_optimize( abap_true ).
        lo_salv->get_display_settings( )->set_striped_pattern( abap_true ).

        DATA(lo_sorts) = lo_salv->get_sorts( ).
        lo_sorts->add_sort( columnname = 'MATNR' ).
        lo_sorts->add_sort( columnname = 'WERKS' ).

        DATA(lo_layout) = lo_salv->get_layout( ).
        lo_layout->set_key( VALUE salv_s_layout_key( report = sy-repid ) ).
        lo_layout->set_save_restriction( if_salv_c_layout=>restrict_none ).

        lv_rows = lines( ct_output ).
        MESSAGE s006 WITH lv_rows.

        lo_salv->display( ).

      CATCH cx_salv_msg cx_salv_not_found cx_salv_existing
            cx_salv_data_error INTO DATA(lx_salv).
        MESSAGE lx_salv TYPE 'I' DISPLAY LIKE 'E'.
    ENDTRY.
  ENDMETHOD.

  METHOD hide_export_functions.
    " Standard ALV function codes for export / download / send /
    " in-place spreadsheet view. Verified against the system's SALV
    " release at build time (Build record section 12, issue B-02).
    CONSTANTS:
      lc_fc_local_file  TYPE string VALUE '%PC',
      lc_fc_spreadsheet TYPE string VALUE '&XXL',
      lc_fc_send_mail   TYPE string VALUE '%SL',
      lc_fc_word_proc   TYPE string VALUE '&AQW',
      lc_fc_xml_export  TYPE string VALUE '&XML',
      lc_fc_view_excel  TYPE string VALUE '&VEXCEL',
      lc_fc_view_lotus  TYPE string VALUE '&VLOTUS'.

    DATA(lt_fcodes) = VALUE string_table(
      ( lc_fc_local_file )  ( lc_fc_spreadsheet ) ( lc_fc_send_mail )
      ( lc_fc_word_proc )   ( lc_fc_xml_export )  ( lc_fc_view_excel )
      ( lc_fc_view_lotus ) ).

    LOOP AT lt_fcodes INTO DATA(lv_fcode).
      TRY.
          io_functions->set_function( name = lv_fcode boolean = abap_false ).
        CATCH cx_salv_not_found cx_salv_wrong_call.
          " Function not offered in this release - nothing to hide
      ENDTRY.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.

*----------------------------------------------------------------------*
* Events
*----------------------------------------------------------------------*
INITIALIZATION.
  " Access is governed solely by the transaction authorization (TS 10),
  " also when the program is started via SA38/SE38.
  AUTHORITY-CHECK OBJECT 'S_TCODE' ID 'TCD' FIELD 'ZMM001'.
  IF sy-subrc <> 0.
    MESSAGE e005 WITH 'ZMM001'.
  ENDIF.

AT SELECTION-SCREEN.
  DATA(gs_error) = NEW lcl_selection_validator( )->validate(
    ir_werks = s_werks[]
    ir_mtart = s_mtart[]
    ir_matkl = s_matkl[] ).
  IF gs_error IS NOT INITIAL.
    MESSAGE ID 'ZMM_MAT_SUMMARY' TYPE 'E' NUMBER gs_error-msgno
      WITH gs_error-value.
  ENDIF.

START-OF-SELECTION.
  DATA(gt_output) = NEW lcl_data_provider( )->get_rows(
    ir_matnr        = s_matnr[]
    ir_werks        = s_werks[]
    ir_mtart        = s_mtart[]
    ir_matkl        = s_matkl[]
    ir_mstae        = s_mstae[]
    ir_mmsta        = s_mmsta[]
    iv_incl_deleted = p_del ).

  " Rule 9: empty result -> information, back to selection screen
  IF gt_output IS INITIAL.
    MESSAGE s004 DISPLAY LIKE 'I'.
    RETURN.
  ENDIF.

  NEW lcl_alv_view( )->display( CHANGING ct_output = gt_output ).

*----------------------------------------------------------------------*
* Unit tests (TS section 12) - ABAP SQL Test Double framework
*----------------------------------------------------------------------*
CLASS ltc_mat_summary DEFINITION FINAL FOR TESTING
  RISK LEVEL HARMLESS DURATION SHORT.

  PRIVATE SECTION.
    CONSTANTS:
      lc_mat_a TYPE mara-matnr VALUE 'TEST_MAT_A',  " 2 plants, active
      lc_mat_b TYPE mara-matnr VALUE 'TEST_MAT_B',  " client-level deleted
      lc_mat_c TYPE mara-matnr VALUE 'TEST_MAT_C',  " no plant record
      lc_mat_d TYPE mara-matnr VALUE 'TEST_MAT_D',  " no description
      lc_mat_e TYPE mara-matnr VALUE 'TEST_MAT_E'.  " deleted in P001 only

    CLASS-DATA so_env TYPE REF TO if_osql_test_environment.
    DATA mo_provider  TYPE REF TO lcl_data_provider.
    DATA mo_validator TYPE REF TO lcl_selection_validator.

    CLASS-METHODS class_setup.
    CLASS-METHODS class_teardown.
    METHODS setup.
    METHODS teardown.

    METHODS matnr_range
      IMPORTING iv_matnr        TYPE mara-matnr
      RETURNING VALUE(rr_range) TYPE ty_matnr_range.

    METHODS two_plants_one_row_each   FOR TESTING.
    METHODS no_plant_record_not_shown FOR TESTING.
    METHODS client_deletion_excluded  FOR TESTING.
    METHODS plant_deletion_excluded   FOR TESTING.
    METHODS deleted_included_on_flag  FOR TESTING.
    METHODS missing_text_left_blank   FOR TESTING.
    METHODS plant_filter_and_sort     FOR TESTING.
    METHODS invalid_values_rejected   FOR TESTING.
ENDCLASS.

CLASS ltc_mat_summary IMPLEMENTATION.
  METHOD class_setup.
    so_env = cl_osql_test_environment=>create(
      i_dependency_list = VALUE #( ( 'MARA' ) ( 'MARC' ) ( 'MAKT' )
                                   ( 'T001W' ) ( 'T134' ) ( 'T023' ) ) ).
  ENDMETHOD.

  METHOD class_teardown.
    so_env->destroy( ).
  ENDMETHOD.

  METHOD setup.
    so_env->clear_doubles( ).

    DATA lt_mara  TYPE STANDARD TABLE OF mara  WITH EMPTY KEY.
    DATA lt_marc  TYPE STANDARD TABLE OF marc  WITH EMPTY KEY.
    DATA lt_makt  TYPE STANDARD TABLE OF makt  WITH EMPTY KEY.
    DATA lt_t001w TYPE STANDARD TABLE OF t001w WITH EMPTY KEY.
    DATA lt_t134  TYPE STANDARD TABLE OF t134  WITH EMPTY KEY.
    DATA lt_t023  TYPE STANDARD TABLE OF t023  WITH EMPTY KEY.

    lt_mara = VALUE #( mandt = sy-mandt mtart = 'ROH' matkl = 'G01' meins = 'EA'
      ( matnr = lc_mat_a mstae = '01' )
      ( matnr = lc_mat_b lvorm = abap_true )
      ( matnr = lc_mat_c )
      ( matnr = lc_mat_d )
      ( matnr = lc_mat_e ) ).
    lt_marc = VALUE #( mandt = sy-mandt
      ( matnr = lc_mat_a werks = 'P001' mmsta = 'P1' )
      ( matnr = lc_mat_a werks = 'P002' mmsta = 'P2' )
      ( matnr = lc_mat_b werks = 'P001' )
      ( matnr = lc_mat_d werks = 'P001' )
      ( matnr = lc_mat_e werks = 'P001' lvorm = abap_true )
      ( matnr = lc_mat_e werks = 'P002' ) ).
    lt_makt = VALUE #( mandt = sy-mandt spras = sy-langu
      ( matnr = lc_mat_a maktx = 'Material A' )
      ( matnr = lc_mat_b maktx = 'Material B' )
      ( matnr = lc_mat_c maktx = 'Material C' )
      ( matnr = lc_mat_e maktx = 'Material E' ) ).
    lt_t001w = VALUE #( mandt = sy-mandt ( werks = 'P001' ) ( werks = 'P002' ) ).
    lt_t134  = VALUE #( mandt = sy-mandt ( mtart = 'ROH' ) ).
    lt_t023  = VALUE #( mandt = sy-mandt ( matkl = 'G01' ) ).

    so_env->insert_test_data( lt_mara ).
    so_env->insert_test_data( lt_marc ).
    so_env->insert_test_data( lt_makt ).
    so_env->insert_test_data( lt_t001w ).
    so_env->insert_test_data( lt_t134 ).
    so_env->insert_test_data( lt_t023 ).

    mo_provider  = NEW #( ).
    mo_validator = NEW #( ).
  ENDMETHOD.

  METHOD teardown.
    so_env->clear_doubles( ).
  ENDMETHOD.

  METHOD matnr_range.
    rr_range = VALUE #( ( sign = 'I' option = 'EQ' low = iv_matnr ) ).
  ENDMETHOD.

  METHOD two_plants_one_row_each.
    " UT-1 / FS Rules 1, 6
    DATA(lt_rows) = mo_provider->get_rows( ir_matnr = matnr_range( lc_mat_a ) ).
    cl_abap_unit_assert=>assert_equals( act = lines( lt_rows ) exp = 2 ).
    cl_abap_unit_assert=>assert_equals( act = lt_rows[ 1 ]-werks exp = 'P001' ).
    cl_abap_unit_assert=>assert_equals( act = lt_rows[ 1 ]-mmsta exp = 'P1' ).
    cl_abap_unit_assert=>assert_equals( act = lt_rows[ 2 ]-mmsta exp = 'P2' ).
    cl_abap_unit_assert=>assert_equals( act = lt_rows[ 2 ]-mstae exp = '01' ).
    cl_abap_unit_assert=>assert_equals( act = lt_rows[ 1 ]-maktx exp = 'Material A' ).
  ENDMETHOD.

  METHOD no_plant_record_not_shown.
    " UT-2 / FS Rule 2
    DATA(lt_rows) = mo_provider->get_rows( ir_matnr = matnr_range( lc_mat_c ) ).
    cl_abap_unit_assert=>assert_initial( lt_rows ).
  ENDMETHOD.

  METHOD client_deletion_excluded.
    " UT-3 / FS Rule 4 (client level)
    DATA(lt_rows) = mo_provider->get_rows( ir_matnr = matnr_range( lc_mat_b ) ).
    cl_abap_unit_assert=>assert_initial( lt_rows ).
  ENDMETHOD.

  METHOD plant_deletion_excluded.
    " UT-4 / FS Rule 4 (plant level)
    DATA(lt_rows) = mo_provider->get_rows( ir_matnr = matnr_range( lc_mat_e ) ).
    cl_abap_unit_assert=>assert_equals( act = lines( lt_rows ) exp = 1 ).
    cl_abap_unit_assert=>assert_equals( act = lt_rows[ 1 ]-werks exp = 'P002' ).
  ENDMETHOD.

  METHOD deleted_included_on_flag.
    " UT-5 / FS Rule 4 (checkbox on)
    DATA(lr_matnr) = VALUE ty_matnr_range(
      ( sign = 'I' option = 'EQ' low = lc_mat_b )
      ( sign = 'I' option = 'EQ' low = lc_mat_e ) ).
    DATA(lt_rows) = mo_provider->get_rows( ir_matnr        = lr_matnr
                                           iv_incl_deleted = abap_true ).
    cl_abap_unit_assert=>assert_equals( act = lines( lt_rows ) exp = 3 ).
  ENDMETHOD.

  METHOD missing_text_left_blank.
    " UT-6 / FS Rule 5
    DATA(lt_rows) = mo_provider->get_rows( ir_matnr = matnr_range( lc_mat_d ) ).
    cl_abap_unit_assert=>assert_equals( act = lines( lt_rows ) exp = 1 ).
    cl_abap_unit_assert=>assert_initial( lt_rows[ 1 ]-maktx ).
  ENDMETHOD.

  METHOD plant_filter_and_sort.
    " UT-7 / FS Rule 3 + section 7 sort (B and E/P001 excluded as deleted)
    DATA(lt_rows) = mo_provider->get_rows(
      ir_werks = VALUE #( ( sign = 'I' option = 'EQ' low = 'P001' ) ) ).
    cl_abap_unit_assert=>assert_equals( act = lines( lt_rows ) exp = 2 ).
    cl_abap_unit_assert=>assert_equals( act = lt_rows[ 1 ]-matnr exp = lc_mat_a ).
    cl_abap_unit_assert=>assert_equals( act = lt_rows[ 2 ]-matnr exp = lc_mat_d ).
  ENDMETHOD.

  METHOD invalid_values_rejected.
    " UT-8 / FS Rule 7
    cl_abap_unit_assert=>assert_equals(
      act = mo_validator->validate(
              ir_werks = VALUE #( ( sign = 'I' option = 'EQ' low = 'ZZZZ' ) ) )-msgno
      exp = '001' ).
    cl_abap_unit_assert=>assert_equals(
      act = mo_validator->validate(
              ir_mtart = VALUE #( ( sign = 'I' option = 'EQ' low = 'ZZZZ' ) ) )-msgno
      exp = '002' ).
    cl_abap_unit_assert=>assert_equals(
      act = mo_validator->validate(
              ir_matkl = VALUE #( ( sign = 'I' option = 'EQ' low = 'ZZZ' ) ) )-msgno
      exp = '003' ).
    cl_abap_unit_assert=>assert_initial(
      mo_validator->validate(
        ir_werks = VALUE #( ( sign = 'I' option = 'EQ' low = 'P001' ) )
        ir_mtart = VALUE #( ( sign = 'I' option = 'EQ' low = 'ROH' ) )
        ir_matkl = VALUE #( ( sign = 'I' option = 'EQ' low = 'G01' ) ) ) ).
  ENDMETHOD.
ENDCLASS.
```

### 3c. Text Elements (`ZMM_MAT_SUMMARY`)
| Type | Key | Text |
|---|---|---|
| Title | — | Material Summary |
| Text symbol | B01 | Selection criteria |
| Text symbol | B02 | Options |
| Selection text | S_MATNR, S_WERKS, S_MTART, S_MATKL, S_MSTAE, S_MMSTA | ☑ Dictionary reference |
| Selection text | P_DEL | Include materials flagged for deletion |

### 3d. Execution Steps (for the session/developer with SAP DEV access)
1. `SAPTransport list` — reuse an open Workbench request whose description contains "MM-RPT-001"; otherwise `create` one: `MM-RPT-001 Material Summary Application`. Use it for every step below.
2. Create package `ZMM_MATSUM` (software component/transport layer per DEV standard).
3. Create message class `ZMM_MAT_SUMMARY` with messages §3a; activate.
4. Create program `ZMM_MAT_SUMMARY` (type Executable) with source §3b and text elements §3c → `SAPDiagnose syntax` → fix → `SAPActivate`.
5. Create report transaction `ZMM001` (program `ZMM_MAT_SUMMARY`, screen 1000); activate.
6. `SAPDiagnose unittest` on `ZMM_MAT_SUMMARY` → record §5; fix and re-run until green.
7. `SAPDiagnose atc` (default variant) → record §8; fix all priority 1/2 findings.
8. Verify issue B-02 (export function codes) in SE38 → ZMM001 run: open toolbar *Export* menu and context menu; if any export entry is still visible, add its function code to `hide_export_functions` and re-run.
9. Run Component Test Plan §9 with the FS test data; record actual results.
10. Release the task (keep the request open for `/Testing` unless the team standard releases it at build completion) → §10.

## 4. Coding Standards & Security Compliance
Self-review of the source in §3b (static reading, not a system check):

| Check | Status | Notes |
|---|---|---|
| Naming conventions & modularization | ✅ Reviewed | Names per `config/naming-standards.json` (program, tcode, message class, package, `lcl_`/`ltc_`, `lv_`/`lt_`/`ls_`/`lo_`/`lr_`/`gv_`/`gs_`/`gt_`/`mo_`/`so_`/`ir_`/`iv_`/`rt_`/`rs_`/`lc_`/`ty_`); three single-purpose local classes |
| Performance best practices (no nested SELECTs, proper JOINs, no `SELECT *`) | ✅ Reviewed | One joined SELECT with explicit field list and DB-side ORDER BY; validation lookups on buffered customizing tables, one per entered single value |
| Authorization checks & input validation | ✅ Reviewed | `S_TCODE` check at INITIALIZATION; entered plant/type/group validated (Rule 7); all input via typed ranges |
| No hardcoded credentials; dynamic SQL handled safely | ✅ Reviewed | No credentials; no dynamic SQL — all static Open SQL with host variables |
| Inline documentation/comments per team standard | ✅ Reviewed | Header block with Object ID/spec refs; ABAP Doc on public methods; FS rule references at each implementation point |

## 5. Unit Test Results
| # | Test Case (from TS Section 12) | Method/Class | Result | Evidence |
|---|---|---|---|---|
| 1 | Material in 2 plants → 2 rows, both statuses | `ltc_mat_summary->two_plants_one_row_each` | ⬜ Pending execution | — |
| 2 | Material without MARC not returned | `no_plant_record_not_shown` | ⬜ Pending execution | — |
| 3 | Client-level deletion excluded | `client_deletion_excluded` | ⬜ Pending execution | — |
| 4 | Plant-level deletion excluded (that plant only) | `plant_deletion_excluded` | ⬜ Pending execution | — |
| 5 | Deleted included when checkbox on | `deleted_included_on_flag` | ⬜ Pending execution | — |
| 6 | Missing logon-language text → blank | `missing_text_left_blank` | ⬜ Pending execution | — |
| 7 | Plant filter + sort MATNR/WERKS | `plant_filter_and_sort` | ⬜ Pending execution | — |
| 8 | Invalid plant/type/group → 001/002/003 | `invalid_values_rejected` | ⬜ Pending execution | — |

## 6. Self-Test Against FS Scenarios
| FS Scenario Ref (Section 11) | Result |
|---|---|
| 1 — Run with no selection | ⬜ Pending execution |
| 2 — Single plant | ⬜ Pending execution |
| 3 — Material type + group | ⬜ Pending execution |
| 4 — Include deletion-flagged | ⬜ Pending execution |
| 5 — No matching materials | ⬜ Pending execution |
| 6 — Non-existent plant | ⬜ Pending execution |
| 7 — No export/download available | ⬜ Pending execution |

## 7. Code Review
| Reviewer | Findings | Resolution | Status |
|---|---|---|---|
| SAP-SDLC (AI self-review) | (1) Export function codes are release-dependent → tolerant loop + mandatory on-system check (B-02). (2) S_TCODE check blocks SA38 execution for users without ZMM001 — intended per TS §10. No other findings. | Documented; verification step §3d.8 | ✅ Self-review done |
| Peer reviewer | — | — | ⬜ Pending |

## 8. Static Code Analysis
| Tool | Result | Exceptions Documented |
|---|---|---|
| Code Inspector / ATC | ⬜ Pending execution | — |

## 9. Component Test Plan (Finalized)
> From TS Section 12a; no new conditions surfaced during coding. Test data to be provided by the Materials Management team (FS §11).

| # | Acceptance Test Criteria | Test Data / Selection Parameters | Expected Result | Actual Result |
|---|---|---|---|---|
| 1 | ZMM001, no selection | Blank selection; materials in 2+ plants exist | All non-deleted material × plant rows, 8 columns in FS order, sorted MATNR/WERKS, message 006 with row count | ⬜ Pending |
| 2 | One plant | `S_WERKS` = test plant | Only that plant's rows | ⬜ Pending |
| 3 | Type + group | `S_MTART`, `S_MATKL` = test values | Only matching rows | ⬜ Pending |
| 4 | Deletion checkbox | Client- and plant-level flagged materials; `P_DEL` off, then on | Off: excluded; On: included | ⬜ Pending |
| 5 | No match | `S_MATNR` = non-existent material | Message 004 (info), stays on selection screen | ⬜ Pending |
| 6 | Invalid plant | `S_WERKS` = `ZZZZ` | Message 001 (error), stays on selection screen | ⬜ Pending |
| 7 | Export functions | Any result list | No spreadsheet / local file / send / XML / word-processing / Excel in-place function in toolbar or context menu | ⬜ Pending |
| 8 | No transaction authorization | Test user without ZMM001, run via SA38 | Message 005 | ⬜ Pending |

## 10. Transport Finalization
| Transport Request | Type (Workbench/Customizing) | Contents | Released Date | Ready for QA? |
|---|---|---|---|---|
| ⚠️ To be created (`MM-RPT-001 Material Summary Application`) | Workbench | DEVC ZMM_MATSUM, PROG ZMM_MAT_SUMMARY (+ text elements), MSAG ZMM_MAT_SUMMARY, TRAN ZMM001 | — | ❌ No — not built yet |

## 11. Assumptions & Dependencies
- ⚠️ Target release S/4HANA on-premise (ABAP 7.50+) — required for the Open SQL syntax used (`@` host variables, comma-separated field list, host variable in outer-join ON condition) and `cl_osql_test_environment`.
- ⚠️ DEV client, software component and transport layer to be confirmed at execution.
- Dependency: SAP DEV access for the executing session/developer (see Issues Log B-01).
- Dependency: Security team adds ZMM001 to the Plant/Warehouse Operations role (SA §7).
- Dependency: Materials Management team supplies component test data (FS §11).

## 12. Issues Log
| Issue ID | Description | Resolution | Schedule Impact | Budget Impact | Status |
|---|---|---|---|---|---|
| B-01 | No SAP system connector attached to the build session — objects cannot be created, activated, unit-tested, ATC-checked, or transported from it | Build package completed in this record; execute §3d in a session with the SAP ADT MCP connected (or manually in SE80/ADT) | Build execution deferred until connection is available | None | Open (manual dependency) |
| B-02 | ALV export function codes / `set_function` behaviour are release-dependent | Tolerant implementation (unknown codes ignored) + mandatory on-system verification, step §3d.8 | None | None | Open (verify at execution) |

## 13. Sign-off
| Role | Name | Status |
|---|---|---|
| Developer | SAP-SDLC (AI-assisted) | ⬜ Pending — build package prepared, execution pending |
| Peer Reviewer | | ⬜ Pending |
| Technical Lead | | ⬜ Pending |

---
**Next step:** Execute §3d in SAP DEV, record results in §§5–10, then `/Testing` for Object ID: MM-RPT-001, using this Build & Unit Test Record and the linked TS/FS as reference.
