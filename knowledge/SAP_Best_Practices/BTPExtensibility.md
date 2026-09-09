# BTP Side-by-Side Extensibility Notes (2026)

- BTP adoption has crossed 50% of SAP customers and is treated as the extension platform of record, not an alternative to in-app extensibility.
- The extension model has moved beyond "Cloud Foundry vs Kyma" framing into event-driven architecture — a side-by-side extension reacts to business events (e.g., Sales Order created) rather than only requesting/polling data.
- SAP Integration Suite is the recommended layer to decouple systems/data/APIs/events/processes, not just custom code avoidance — point-to-point integrations and undocumented direct data access are clean-core risks in their own right.
- Identity: prefer Principal Propagation over a single shared technical user for side-by-side extensions that write back to the core.
- AI tooling (Joule Studio) can now generate a large share of boilerplate CAP logic and OData service bindings automatically — review generated boilerplate against CleanCoreCertification.md before accepting it as final.
