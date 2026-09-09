# OData Service Best Practices

- Entity/association names should be business-meaningful, not raw table names.
- Version services deliberately (v2 vs v4) — confirm which is required by TS before building.
- Keep read vs. write operations clearly scoped per the FS's stated behavior.
