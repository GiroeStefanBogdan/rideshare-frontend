# Use domain-specific ID responses

The backend returns `201 Created` with `{ "rideId": number }` after publishing a Ride and `{ "bookingId": number }` after a successful Reservation. Domain-specific fields make each response self-describing and extensible, avoiding the ambiguity and frontend failures caused by bare numeric IDs or a generic `id` field. Because DrumBun is a prototype, the backend, frontend, and API documentation adopt these responses atomically without a compatibility period.
