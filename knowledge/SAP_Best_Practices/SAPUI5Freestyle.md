# Freestyle SAPUI5 Best Practices

- Choose freestyle only when Fiori Elements floorplans cannot express the required interaction (e.g. heavily custom canvas, non-tabular visual editors, wizard flows outside standard patterns). Document that justification in the TS.
- Follow the standard app structure: `manifest.json` as the single source of app config (routing, models, data sources, dependencies), MVC separation, one view per screen, fragments for reusable UI.
- Bind against an OData model (V4 `sap.ui.model.odata.v4.ODataModel` for new apps); avoid manual AJAX calls and avoid storing business logic in the browser.
- Keep formatters, validation, and helper logic in separate modules with unit tests (QUnit / OPA5), not inline in controllers.
- Use `sap.m` responsive controls and the semantic page/flexible column layout; respect SAP Fiori design guidelines so the app is visually indistinguishable from standard apps.
- Externalise all UI texts to `i18n` resource bundles — never hard-code labels.
- Consume released OData services / CDS-based services only; do not bypass the service layer with direct RFC or table access.
- Build and deploy through the standard toolchain (UI5 Tooling, `ui5 build`) and deploy to the ABAP repository (BSP) or BTP HTML5 app repository per the confirmed platform.
