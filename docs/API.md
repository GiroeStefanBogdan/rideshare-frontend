# REST API Contract

These are the **only endpoints that exist**. Do not invent paths, methods, or query parameters not listed here.

The backend runs on `http://localhost:8080` by default. In development, the Vite proxy forwards `/api` requests automatically — you do not need to prefix URLs with the full origin.

All requests must go through the API client wrapper:

```ts
import { ApiError, request } from '$lib/api/client';
```

---

## Authentication

| Action      | Method | Path           | Request body                      | Response        | Cookie         |
| ----------- | ------ | -------------- | --------------------------------- | --------------- | -------------- |
| Register    | POST   | `/register`    | `UserRegistrationRequest`         | `User`          | —              |
| Email login | POST   | `/login`       | `{ email, password, rememberMe }` | `LoginResponse` | Sets `token`   |
| Logout      | POST   | `/auth/logout` | —                                 | 204             | Clears `token` |

---

## Rides — `/rides`

| Action         | Method | Path                            | Auth          | Request body         | Response               |
| -------------- | ------ | ------------------------------- | ------------- | -------------------- | ---------------------- |
| Search rides   | POST   | `/rides/search`                 | Public        | `RideSearchParams`   | `RideSearchResult[]`   |
| Get one ride   | GET    | `/rides/:id`                    | Public        | —                    | `RideDetails`          |
| Publish a ride | POST   | `/rides`                        | User          | `PublishRideRequest` | 201 numeric ride ID    |
| Reserve seats  | POST   | `/rides/:id/reserve`            | User          | `ReserveRideRequest` | 201 numeric booking ID |
| Delete a ride  | DELETE | `/rides/:id`                    | Owner         | —                    | 204                    |
| My rides       | GET    | `/rides/me`                     | User          | —                    | `MyRidesResponse`      |
| Cancel booking | DELETE | `/rides/me/bookings/:bookingId` | Booking owner | —                    | 204, no body           |

`PublishRideRequest` contains `seatsTotal` (1–4), optional `carId`, and 2–7 ordered `rideStops`.
Each stop contains `id`, `type`, `stopOrder`, `departsAt`, and an increasing
`cumulativePricePerSeat`; the Origin value is `0`.

### My Rides

`GET /rides/me` retains four independently sorted arrays: `upcomingBookings`, `pastBookings`,
`upcomingHostedRides`, and `pastHostedRides`. Booking entries contain `bookingId`, `rideId`,
booked stops, seat count, total RON price, driver summary, and derived `ACTIVE`/`CANCELLED` status.
Hosted entries contain `rideId`, status, total seats, and ordered stops with departure time,
available seats, and cumulative per-seat price. Search and detail stops include both the
street/location name and its municipality name.

- Server classification uses scheduled **end**, not start: booking `toStop.departsAt` (drop-off)
  or hosted final stop `departsAt` (highest `stopOrder`).
- Past is inclusive `now.minusMonths(1) <= end <= now`; the cutoff is one calendar month, not
  30 days. Older ends are omitted. Upcoming is `end > now` or a legacy null end.
- Upcoming sorts start ASC (pickup / hosted departure); Past sorts end DESC. Null keys sort
  last; booking ID / ride ID ASC breaks ties. Ongoing rides stay Upcoming until their end.
- Both server time buckets include cancellations. A booking is `ACTIVE` only when both booking
  and ride are active; otherwise it is `CANCELLED`. Hosted status follows the ride. The backend
  maps persisted legacy `INACTIVE` to `CANCELLED`; frontend `RideStatus` accepts only the two wire values.
- `/my-rides` renders active Upcoming plus Cancelled from **both** buckets for each role;
  `/my-rides/past` renders active Past only. These are UI routes; there is no new past API or
  `role` API parameter. `?role=booked|hosted` preserves the UI selection between pages.
- Fetch on page mount, retry explicitly, and refetch after successful passenger cancellation.
  No polling, focus refresh, or client timer moves cards between server time buckets.

### Passenger cancellation

`cancelBooking(bookingId)` in `src/lib/api/rides.ts` sends
`DELETE /rides/me/bookings/{bookingId}` through the cookie-authenticated client, with no body.

- Missing bookings and another passenger's bookings return **404** (`Booking Not Found`).
- Active booking + active ride: pickup must be strictly after server `now`. At/after pickup,
  or with a legacy null pickup, the cancellation is expired.
- Required expiry response is **409 Conflict** (`Booking Cancellation Expired`); the backend
  `GlobalExceptionHandler.handleBookingCancellationExpired` returns 409. Error `message` may be null.
- Already cancelled/legacy inactive booking **or ride** returns **204** as a no-op, even after
  pickup. No capacity or status changes occur on that path.
- Success returns **204** and marks only the booking `CANCELLED`, restoring exactly its seats
  on `[fromOrder, toOrder)` once. The backend transaction locks ride → booking → stops to
  serialize with reservations and prevent duplicate release.
- UI confirms the action, guards duplicate submissions, and refetches `GET /rides/me` after
  success instead of optimistically changing status/capacity. Failure shows an error alert.

Driver `DELETE /rides/:id` persists `CANCELLED` only on the ride; it preserves bookings, stops,
and capacity. Composed booking status makes those bookings appear cancelled without rewriting them.
New published stop times are required; legacy missing times are displayed as unavailable, never invented.

---

## Locations

`GET /locations/search?q={query}` is public and returns matching administrative units and streets.

---

## Users — `/users`

| Action              | Method | Path                 | Auth   | Request body        | Response            |
| ------------------- | ------ | -------------------- | ------ | ------------------- | ------------------- |
| Get public profile  | GET    | `/users/:id`         | Public | —                   | `UserPublicProfile` |
| Get own profile     | GET    | `/users/me`          | User   | —                   | `UserProfile`       |
| Update own profile  | PATCH  | `/users/me`          | User   | `UpdateUserRequest` | `UserProfile`       |
| Change own password | PATCH  | `/users/me/password` | User   | `ChangePassword`    | 204                 |
| Delete own account  | DELETE | `/users/me`          | User   | —                   | 204                 |
| List own cars       | GET    | `/users/me/cars`     | User   | —                   | `UserCar[]`         |
| Add an own car      | POST   | `/users/me/cars`     | User   | `UserCarInput`      | `UserCar`           |
| Update an own car   | PATCH  | `/users/me/cars/:id` | User   | `UserCarInput`      | `UserCar`           |
| Delete an own car   | DELETE | `/users/me/cars/:id` | User   | —                   | 204                 |

---

## Reviews

> Planned feature: review endpoints are not implemented yet. The frontend displays an unavailable state until this contract is delivered.

---

## Error Handling

The backend returns structured error bodies. The client wrapper in `client.ts` shapes these into a consistent error object before throwing. Always catch by checking `err.status`:

```ts
try {
	await request('/rides', { method: 'POST', body: JSON.stringify(payload) });
} catch (err) {
	if (err instanceof ApiError && err.status === 400) {
		// Display the backend validation message.
	}
}
```

Do not inspect raw `Response` objects — use the shaped error from the client.
