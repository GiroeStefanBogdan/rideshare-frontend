# Use explicit CANCELLED status

Use `ACTIVE` / `CANCELLED` as the My Rides wire status so cancellation is distinct from time-derived
Upcoming/Past. The backend persists explicit `CANCELLED` for new cancellations, while accepting
legacy `INACTIVE` records and normalizing them to `CANCELLED` before serialization. A booking is
active only when both booking and ride are active; driver cancellation changes only the ride.

## Compatibility and consequences

Keep the existing four response arrays. Main My Rides filters active Upcoming and merges Cancelled
from both server time buckets; the separate Past page shows active Past only. Frontend types do not
accept `INACTIVE`: compatibility belongs in backend mapping, not duplicated client fallbacks.
After passenger cancellation succeeds, explicitly refetch rather than guessing status or capacity.

See [API](../API.md#my-rides) and [architecture](../ARCHITECTURE.md#my-rides-and-passenger-cancellation).
