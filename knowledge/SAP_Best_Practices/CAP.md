# CAP (SAP Cloud Application Programming Model) Best Practices

- Use CAP for side-by-side extensions and standalone apps on BTP — it is the BTP counterpart to RAP, not a replacement for it. For extensions that live on the S/4HANA stack, prefer RAP.
- Model the domain in CDS (`db/schema.cds`) and expose it through service definitions (`srv/`) — keep the persistence model and the service model as separate layers.
- Keep custom logic in service handlers (Node.js or Java) thin; push filtering, projection, and calculation into CDS where possible.
- Consume S/4HANA data through released APIs (OData/SOAP) imported as external services; never replicate core data without a documented reason and lifecycle.
- Use the built-in features rather than re-implementing them: authorization (`@requires`, `@restrict`), input validation (`@assert`), localisation, draft handling, audit logging.
- Externalise configuration and destinations; bind services via BTP service bindings, not hard-coded URLs or credentials.
- Ship database changes through CAP's deployment (`cds deploy` / MTA) to SAP HANA Cloud; use SQLite only for local development.
- Include automated tests (`cds.test`) for every service handler; add a CI pipeline (Transport Management / gCTS or MTA pipeline) before go-live.
- Review AI-generated CAP boilerplate against CleanCoreCertification.md before accepting it.
