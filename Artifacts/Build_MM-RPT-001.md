# Build & Unit Test Record

> **Built in PS4 (S/4HANA on-premise, ABAP 8.16) on 2026-09-25.** Every result below was obtained from the live system via the SAP ADT connection. Two items are manual SAP GUI steps the connection cannot perform (transaction code creation and text-element activation) and are marked ⬜ Pending (Issues B-03, B-04).

## 1. Document Control
| Field | Value |
|---|---|
| Object ID | MM-RPT-001 |
| Object Name | Material Summary Application (`ZMM_MAT_SUMMARY`) |
| Linked Technical Spec Ref | [TechnicalSpec_MM-RPT-001.md](TechnicalSpec_MM-RPT-001.md) |
| Linked Functional Spec Ref | [FunctionalSpec_MM-RPT-001.md](FunctionalSpec_MM-RPT-001.md) |
| Developer | SAP-SDLC (AI-assisted) for shilpiverma.iin@gmail.com — SAP user SHILPI |
| Version | 1.1 |
### Version History
| Version | Date | Changed By | Change Summary | Status at time |
|---|---|---|---|---|
| 1.0 | 2026-09-23 | shilpiverma.iin@gmail.com | Initial creation — build package prepared; SAP execution pending live connection | Draft |
| 1.1 | 2026-09-25 | shilpiverma.iin@gmail.com | Built, activated, unit-tested and ATC-checked in PS4; export suppression switched to typed SALV setters (B-02); results recorded | In Progress |

## 2. Development Environment & Transport
| Item | Value |
|---|---|
| System | PS4 — S/4HANA on-premise, ABAP release 8.16 (connection via SAP ADT) |
| DEV Client | Connection client of the PS4 ADT session (development client) |
| Package | `ZMM_MATSUM` — software component HOME, transport layer ZPS4, responsible SHILPI |
| Workbench Request (single) | **PS4K902076** "MM-RPT-001 Material Summary Application" (task PS4K902077), target PS4.100 |
| Customizing Request (single, if applicable) | Not applicable — no configuration (TS §10a) |

> Note: PS4 also holds request PS4K901998 / package ZMM_OPENPO labelled "MM-RPT-001 Open Purchase Orders App" — a different application sharing the same Requirement ID. Per the user's decision (2026-09-25), this build keeps MM-RPT-001 in a separate request; the two are distinguished by description (Issue B-05).

## 3. Objects Built
| Seq | Object Type | Object Name | Status | Deviation from TS? |
|---|---|---|---|---|
| 1 | Development Package | `ZMM_MATSUM` | ✅ Created | None |
| 2 | Message Class | `ZMM_MAT_SUMMARY` (msgs 001–006, §3a) | ✅ Created & active | None |
| 3 | Program (executable) | `ZMM_MAT_SUMMARY` (source §3b) | ✅ Created & active | Export suppression via `CL_SALV_FUNCTIONS_LIST` typed setters instead of generic `set_function` — same behavior as TS Rule 8, see B-02 |
| 4 | Text elements | `ZMM_MAT_SUMMARY` (§3c) | ⚠️ Saved, **inactive** — manual activation (B-04) | None |
| 5 | Transaction (report transaction) | `ZMM001` → `ZMM_MAT_SUMMARY`, screen 1000 | ⬜ Manual SE93 (B-03) | None |

### 3a. Message Class `ZMM_MAT_SUMMARY` (short text: "MM-RPT-001 Material Summary")
| No. | Text |
|---|---|
| 001 | Plant &1 does not exist |
| 002 | Material type &1 does not exist |
| 003 | Material group &1 does not exist |
| 004 | No materials found for the selection criteria |
| 005 | You are not authorized to use transaction &1 |
| 006 | &1 material/plant rows selected |

### 3b. Program `ZMM_MAT_SUMMARY` — source as active in PS4

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
    " Export group (spreadsheet, local file, send/mail, word processing,
    " XML, HTML, folder) and the in-place spreadsheet/Crystal views.
    " Typed setters are used because set_function( ) rejects standard
    " SALV functions with cx_salv_wrong_call.
    io_functions->set_group_export( abap_false ).
    io_functions->set_export_spreadsheet( abap_false ).
    io_functions->set_export_localfile( abap_false ).
    io_functions->set_export_mail( abap_false ).
    io_functions->set_export_send( abap_false ).
    io_functions->set_export_wordprocessor( abap_false ).
    io_functions->set_export_xml( abap_false ).
    io_functions->set_export_html( abap_false ).
    io_functions->set_export_folder( abap_false ).
    io_functions->set_view_excel( abap_false ).
    io_functions->set_view_lotus( abap_false ).
    io_functions->set_view_crystal( abap_false ).
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
| Text symbol | B01 | Selection criteria |
| Text symbol | B02 | Options |
| Selection text | S_MATNR | Material |
| Selection text | S_WERKS | Plant |
| Selection text | S_MTART | Material Type |
| Selection text | S_MATKL | Material Group |
| Selection text | S_MSTAE | Cross-plant Status |
| Selection text | S_MMSTA | Plant-specific Status |
| Selection text | P_DEL | Include deletion-flagged (30-char limit; FS wording "Include materials flagged for deletion" shortened) |

## 4. Coding Standards & Security Compliance
| Check | Status | Notes |
|---|---|---|
| Naming conventions & modularization | ✅ Confirmed | Names per `config/naming-standards.json`; three single-purpose local classes + test class |
| Performance best practices (no nested SELECTs, proper JOINs, no `SELECT *`) | ✅ Confirmed | One joined SELECT, explicit field list, DB-side ORDER BY. Measured on PS4: full unfiltered selection = 997 rows in ~0.34 s |
| Authorization checks & input validation | ✅ Confirmed | `S_TCODE` check for ZMM001 at INITIALIZATION; plant/type/group validation (unit-tested) |
| No hardcoded credentials; dynamic SQL handled safely | ✅ Confirmed | None; static Open SQL only |
| Inline documentation/comments per team standard | ✅ Confirmed | Header block, ABAP Doc, FS rule references |

## 5. Unit Test Results
Run: `SAPDiagnose unittest` on PROG ZMM_MAT_SUMMARY, 2026-09-25 — **8 / 8 passed, 0 failures, 0 errors** (ABAP SQL Test Double framework on MARA/MARC/MAKT/T001W/T134/T023).

| # | Test Case (from TS Section 12) | Method/Class | Result | Evidence |
|---|---|---|---|---|
| 1 | Material in 2 plants → 2 rows, both statuses | `LTC_MAT_SUMMARY->TWO_PLANTS_ONE_ROW_EACH` | ✅ Passed | ABAP Unit run, 100 ms |
| 2 | Material without MARC not returned | `NO_PLANT_RECORD_NOT_SHOWN` | ✅ Passed | 170 ms |
| 3 | Client-level deletion excluded | `CLIENT_DELETION_EXCLUDED` | ✅ Passed | 740 ms |
| 4 | Plant-level deletion excluded (that plant only) | `PLANT_DELETION_EXCLUDED` | ✅ Passed | 100 ms |
| 5 | Deleted included when checkbox on | `DELETED_INCLUDED_ON_FLAG` | ✅ Passed | 210 ms |
| 6 | Missing logon-language text → blank | `MISSING_TEXT_LEFT_BLANK` | ✅ Passed | 100 ms |
| 7 | Plant filter + sort MATNR/WERKS | `PLANT_FILTER_AND_SORT` | ✅ Passed | 190 ms |
| 8 | Invalid plant/type/group → 001/002/003 | `INVALID_VALUES_REJECTED` | ✅ Passed | 150 ms |

Coverage: statement 34.9 %, branch 53.6 %. All data-selection and validation logic (FS Rules 1–7) is covered; `lcl_alv_view` (DISPLAY, HIDE_EXPORT_FUNCTIONS) is UI-only and not unit-testable — verified via component test §9 #1/#7.

## 6. Self-Test Against FS Scenarios
| FS Scenario Ref (Section 11) | Result |
|---|---|
| 1 — Run with no selection | ✅ Data layer verified on PS4 live data: 997 non-deleted material × plant rows, correct columns, sorted MATNR/WERKS (e.g. material 9 "Motorcycle Boots" → plants 1710, HP01). Grid display pending ZMM001 (B-03) |
| 2 — Single plant | ✅ Verified by unit test 7; on-screen run pending B-03 |
| 3 — Material type + group | ✅ Range logic verified (same WHERE clause as #2); on-screen run pending B-03 |
| 4 — Include deletion-flagged | ✅ Verified by unit tests 3–5 (PS4 currently holds 0 deletion-flagged material/plant rows, so live data cannot show a difference) |
| 5 — No matching materials | ⬜ On-screen check pending B-03 |
| 6 — Non-existent plant | ✅ Verified by unit test 8 (message 001); on-screen check pending B-03 |
| 7 — No export/download available | ⬜ On-screen check pending B-03 |

## 7. Code Review
| Reviewer | Findings | Resolution | Status |
|---|---|---|---|
| SAP-SDLC (AI self-review, verified against PS4) | (1) `set_function` rejects standard SALV functions on this release (`cx_salv_wrong_call`) — would have left export visible. (2) S_TCODE check blocks SA38 execution for users without ZMM001 — intended per TS §10. | (1) Replaced with `set_group_export`/`set_export_*`/`set_view_*` typed setters (B-02). (2) No change. | ✅ Done |
| Peer reviewer | — | — | ⬜ Pending |

## 8. Static Code Analysis
| Tool | Result | Exceptions Documented |
|---|---|---|
| ATC, system default variant (DEFAULT), 2026-09-25 | 3 findings, all priority 3, no priority 1/2 | (a) Text symbols B01/B02 "not defined" — caused by inactive text elements, clears after B-04. (b) "MARC has a replacement object" (SLIN) — accepted: only master-data fields WERKS/MMSTA/LVORM are read, not stock fields; direct table reads are the Clean Core deviation inherited from the Solution Architect write-up (TS §2b) |

## 9. Component Test Plan (Finalized)
> From TS Section 12a. PS4 test data observed: 997 active material × plant rows across plants incl. 1710, HP01, 0900; no deletion-flagged rows (scenario 4 therefore relies on unit tests 3–5 unless MM team flags test materials).

| # | Acceptance Test Criteria | Test Data / Selection Parameters | Expected Result | Actual Result |
|---|---|---|---|---|
| 1 | ZMM001, no selection | Blank selection | 997 rows, 8 columns in FS order, sorted MATNR/WERKS, message 006 | Data: ✅ 997 rows, correct order (SQL on PS4). Screen: ⬜ after B-03 |
| 2 | One plant | `S_WERKS` = 1710 | Only plant 1710 rows | ⬜ after B-03 |
| 3 | Type + group | `S_MTART` = FERT, `S_MATKL` = FT | Only matching rows | ⬜ after B-03 |
| 4 | Deletion checkbox | Flag a test material (client and plant level) | Off: excluded; On: included | ✅ Unit tests 3–5; live ⬜ (no flagged data) |
| 5 | No match | `S_MATNR` = non-existent material | Message 004, stays on selection screen | ⬜ after B-03 |
| 6 | Invalid plant | `S_WERKS` = ZZZZ | Message 001, stays on selection screen | ✅ Unit test 8; screen ⬜ after B-03 |
| 7 | Export functions | Any result list | No export / send / Excel in-place function | ⬜ after B-03 |
| 8 | No transaction authorization | User without ZMM001 via SA38 | Message 005 | ⬜ after B-03 + role |

## 10. Transport Finalization
| Transport Request | Type (Workbench/Customizing) | Contents | Released Date | Ready for QA? |
|---|---|---|---|---|
| PS4K902076 (task PS4K902077) | Workbench | R3TR DEVC ZMM_MATSUM, R3TR MSAG ZMM_MAT_SUMMARY, R3TR PROG ZMM_MAT_SUMMARY (+ text elements); R3TR TRAN ZMM001 to be added by SE93 (B-03) | Not released | ⚠️ Not yet — after B-03/B-04 and screen checks |

## 11. Assumptions & Dependencies
- Dependency: Security team adds ZMM001 to the Plant/Warehouse Operations role (SA §7).
- Dependency: Materials Management team flags a test material for deletion if a live check of scenario 4 is wanted (FS §11).

## 12. Issues Log
| Issue ID | Description | Resolution | Schedule Impact | Budget Impact | Status |
|---|---|---|---|---|---|
| B-01 | No SAP connector in the 2026-09-23 session | PS4 connector attached 2026-09-25; build executed | None | None | Closed |
| B-02 | `CL_SALV_FUNCTIONS->set_function` raises `cx_salv_wrong_call` for standard SALV functions (verified by reading the method on PS4) — export would not have been hidden | Rewrote `hide_export_functions` with typed setters `set_group_export`, `set_export_*`, `set_view_excel/lotus/crystal` | None | None | Fixed |
| B-03 | ADT connection cannot create transaction codes | Manual: SE93 create ZMM001 (report transaction → ZMM_MAT_SUMMARY, screen 1000, SAP GUI for Windows/HTML) in PS4K902076 | Minor | None | Open (manual) |
| B-04 | Text elements saved but connection cannot activate the text-element sub-object (PROG/PX) | Manual: SE38 ZMM_MAT_SUMMARY → Goto → Text Elements → Activate (or SE80 inactive objects) | Minor | None | Open (manual) |
| B-05 | Requirement ID MM-RPT-001 also used on PS4 by the Open Purchase Orders App (ZMM_OPENPO / PS4K901998) | User decision 2026-09-25: keep MM-RPT-001, separate request PS4K902076 | None | None | Accepted |
| B-06 | Connector's local pre-write lint is configured for ABAP 7.02 and rejects 7.40+ syntax | Lint skipped; SAP server syntax check used instead (clean except MARC warning) | None | None | Closed |

## 13. Sign-off
| Role | Name | Status |
|---|---|---|
| Developer | SAP-SDLC (AI-assisted) / SHILPI | ✅ Approved — build, unit tests, ATC done |
| Peer Reviewer | | ⬜ Pending |
| Technical Lead | | ⬜ Pending |

---
**Next step:** After B-03 and B-04 are done, re-run ATC and the on-screen component checks, then `/Testing` for Object ID: MM-RPT-001, using this Build & Unit Test Record and the linked TS/FS as reference.
