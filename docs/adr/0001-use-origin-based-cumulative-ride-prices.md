# Use origin-based cumulative Ride prices

Store and exchange each Stop's whole-RON `cumulativePricePerSeat`, beginning with zero at the Origin and increasing by at least one at every later Stop. A passenger's fare is the destination Cumulative Price minus the origin Cumulative Price; this replaces the inverse remaining-fare representation because it matches the publishing experience, makes price progression intuitive, and gives the frontend, API, persistence model, search, and booking calculation one shared representation.

## Consequences

Existing Ride Stop prices require a data migration. Search filters, booking calculations, response mappings, and the Ride's summary price must all use the new subtraction direction, while existing Booking price snapshots remain unchanged.
