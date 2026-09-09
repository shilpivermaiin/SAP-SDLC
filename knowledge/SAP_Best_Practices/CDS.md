# CDS View Best Practices

- Layer views: basic interface view -> composite -> consumption. Don't skip layers for "quick" builds.
- Use associations instead of embedding joins directly where reuse is likely.
- Annotate only what the consuming layer (OData/Fiori/analytics) actually needs.
- Avoid calculated fields in the interface layer — push business logic to the appropriate layer per TS design.
