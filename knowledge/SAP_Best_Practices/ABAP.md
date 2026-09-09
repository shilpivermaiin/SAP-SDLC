# ABAP Coding Best Practices

- Naming: Z-prefix for custom objects; descriptive names, not abbreviations only you understand.
- Avoid SELECT * — select only needed fields.
- Avoid nested SELECTs inside loops — use JOINs or FOR ALL ENTRIES with proper safeguards.
- Modularize: one method/form does one job.
- Use exception classes, not sy-subrc chains, for new development.
- Comment intent, not mechanics — explain "why," the code already shows "what."
- Run ATC/Code Inspector before every transport release.
