# Fiori UX & Launchpad Best Practices

- Design to the SAP Fiori design guidelines: role-based, coherent, simple, delightful. Reuse standard floorplans, controls, and interaction patterns rather than inventing new ones.
- One app = one task for one role. Split a large "do everything" screen into focused apps surfaced from the launchpad.
- Deliver launchpad content through the spaces & pages model (not the legacy group-based home page). Group tiles into pages by business role.
- Expose apps via catalogs assigned to PFCG/business roles; never assign apps or tiles directly to individual users.
- Provide meaningful tile titles, subtitles, and (where useful) dynamic counts driven by an OData `$count` service — avoid vanity KPI tiles that add no decision value.
- Support keyboard navigation, screen readers, and sufficient colour contrast — accessibility (WCAG / EN 301 549) is a delivery requirement, not an enhancement.
- Respect the shell services: navigation via intent-based navigation (`semanticObject`-`action`), not hard-coded URLs, so cross-app links survive deployment changes.
- Confirm the launchpad host: S/4HANA Fiori Launchpad (embedded) vs. SAP Build Work Zone on BTP — role and catalog setup differs between them.
