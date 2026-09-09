# RAP (ABAP RESTful Application Programming Model) Best Practices

- Prefer managed implementation type unless unmanaged is specifically justified.
- Model determinations and validations natively in the behavior definition, not as afterthought BAdIs.
- Keep behavior implementation classes focused — one responsibility per class where possible.
- Use draft handling only when the business process genuinely needs draft/save-for-later semantics.
- RAP requires S/4HANA on-prem 1909+, S/4HANA Cloud, or BTP ABAP Environment — not available on classic ECC.
