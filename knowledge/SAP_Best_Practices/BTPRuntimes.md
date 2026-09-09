# BTP Runtimes Best Practices

- Pick the runtime from the workload, not preference:
  - **ABAP Environment (Steampunk)** — ABAP/RAP developers, tight S/4HANA data affinity, reuse of ABAP skills and transport model.
  - **Cloud Foundry** — polyglot business apps and APIs (CAP Node/Java, SAPUI5), fastest path for most side-by-side extensions.
  - **Kyma** — container/Kubernetes workloads, event-driven microservices, teams that already run K8s.
- Default to Cloud Foundry + CAP for a new side-by-side extension unless there is a specific reason for ABAP Environment or Kyma.
- Keep the runtime stateless; persist in SAP HANA Cloud or the appropriate managed service, never on the app's local filesystem.
- Consume core systems through SAP Integration Suite / released APIs and BTP destinations; use Principal Propagation for user-context calls, not a shared technical user.
- Externalise all configuration and secrets into service bindings / the credential store — nothing hard-coded, nothing in source control.
- Deploy as an MTA through Cloud Transport Management (or gCTS for ABAP Environment) so landscapes stay in sync and auditable.
- Size entitlements deliberately — BTP cost is consumption-based; confirm the subaccount has the required services and quota before committing to a runtime in the TS.
