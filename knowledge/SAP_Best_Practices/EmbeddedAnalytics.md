# SAP Embedded Analytics Best Practices

- Build the analytical model as a layered CDS stack: basic/interface views → composite/cube view (`@Analytics.dataCategory: #CUBE`) → query view (`@Analytics.query: true`). Do not put query logic in the cube.
- Reuse SAP-delivered analytical CDS views (I_/C_ virtual data model) as the source wherever one exists before creating custom cubes.
- Keep measures and dimensions annotated correctly (`@Aggregation.default`, `@Semantics`) so consuming tools (Analytical List Page, Analysis for Office, SAC) interpret them consistently.
- Expose queries through the standard analytical OData/InA endpoints; consume in Fiori via the Analytical List Page or Overview Page, not a custom-coded chart.
- Push all aggregation to the database — no ABAP-side looping/summarisation. Validate the generated SQL is pushed down for realistic data volumes.
- For cross-system or blended reporting, replicate into SAP Datasphere / SAC rather than building large custom cubes on the transactional system.
- Apply analytics authorizations (DCL) on the CDS views so row-level restrictions are enforced consistently across every consumer.
- Confirm platform: the embedded analytics VDM and ALP require S/4HANA (on-prem or Cloud); classic ECC has no equivalent and would need BW.
