# Fiori Elements Best Practices

- Prefer Fiori Elements over freestyle SAPUI5 whenever the app is a standard pattern — List Report / Object Page, Analytical List Page, Overview Page, Worklist. Freestyle is justified only when the interaction genuinely cannot be expressed through a floorplan.
- Drive the UI from CDS/OData annotations (`@UI`, `@Search`, `@Consumption`), not from hand-written XML views — metadata-driven UIs stay consistent and survive OData model changes.
- Keep annotations in a dedicated CDS metadata extension (or local annotation file), separate from the interface view, so UI concerns do not pollute the data model.
- Use OData V4 with the RAP-based Fiori Elements flavour for new build; OData V2 Fiori Elements only when extending an existing V2 service.
- Add value helps, side effects, and draft-enabled create/edit through RAP behavior + annotations rather than UI-side JavaScript.
- Use controller extensions / flexible programming model (building blocks, custom sections) for the small amount of custom UI logic that floorplans do not cover — never fork the whole app to add one field.
- Confirm the target platform supports the required Fiori Elements version: RAP + V4 needs S/4HANA 1909+ (on-prem), S/4HANA Cloud, or BTP ABAP Environment.
- Test the app with realistic data volume — List Report performance depends on the CDS view being pushed down to the database, not on client-side filtering.
