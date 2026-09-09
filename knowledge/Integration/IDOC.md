# IDoc Integration Notes
- Confirm IDoc type/basic type matches what's already standard for the message (e.g., ORDERS05) before creating an extension.
- Segment extensions go through Z-segments, never modify standard segments.
- Always design for idempotent reprocessing (duplicate IDoc handling).
