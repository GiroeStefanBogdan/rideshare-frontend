# REST API Contract

These are the **only endpoints that exist**. Do not invent paths, methods, or query parameters not listed here.

The backend runs on `http://localhost:8080` by default. In development, the Vite proxy forwards `/api` requests automatically — you do not need to prefix URLs with the full origin.

All requests must go through the API client wrapper:

```ts
import { ApiError, request } from '$lib/api/client';
```

---

## Authentication

| Action      | Method | Path           | Request body                      | Response               | Cookie         |
| ----------- | ------ | -------------- | --------------------------------- | ---------------------- | -------------- |
| Email login | POST   | `/login`       | `{ email, password, rememberMe }` | `LoginResponse`        | Sets `token`   |
| Logout      | POST   | `/auth/logout` | —                                 | 204                    | Clears `token` |

---

## Rides — `/rides`

| Action        | Method | Path                 | Auth   | Request body             | Response                |
| ------------- | ------ | -------------------- | ------ | ------------------------ | ----------------------- |
| Search rides  | POST   | `/rides/search`      | Public | `RideSearchParams`       | `RideSearchResult[]`    |
| Get one ride  | GET    | `/rides/:id`         | Public | —                        | `RideDetails`           |
| Post a ride   | POST   | `/rides`             | User   | `RideInput`              | Numeric ride ID         |
| Reserve seats | POST   | `/rides/:id/reserve` | User   | `ReserveRideRequest`     | Numeric booking ID      |
| Delete a ride | DELETE | `/rides/:id`         | Owner  | —                        | 204                     |
| My rides      | GET    | `/rides/me`           | User   | —                        | `MyRidesResponse`       |

`GET /rides/me` returns four independently sorted lists: `upcomingBookings`, `pastBookings`,
`upcomingHostedRides`, and `pastHostedRides`. Booking entries contain the booked stops,
seat count, total RON price, driver summary, and derived `ACTIVE`/`INACTIVE` status.
Hosted entries contain ordered stops with departure time, available seats, and per-seat price.
Search and detail stops include both the street/location name and its municipality name.

`POST /rides` accepts ordered `rideStops`; each stop supplies `departsAt` and `price`.
The first stop determines the ride departure and base price. Stop order, increasing times,
and decreasing prices ending at zero are validated by the backend.

---

## Locations

`GET /locations/search?q={query}` is public and returns matching administrative units and streets.

---

## Users — `/users`

| Action              | Method | Path                  | Auth   | Request body        | Response            |
| ------------------- | ------ | --------------------- | ------ | ------------------- | ------------------- |
| Get public profile  | GET    | `/users/:id`          | Public | —                   | `UserPublicProfile` |
| Get own profile     | GET    | `/users/me`           | User   | —                   | `UserProfile`       |
| Update own profile  | PATCH  | `/users/me`           | User   | `UpdateUserRequest` | `UserProfile`       |
| Change own password | PATCH  | `/users/me/password`  | User   | `ChangePassword`    | 204                 |
| Delete own account  | DELETE | `/users/me`           | User   | —                   | 204                 |
| List own cars       | GET    | `/users/me/cars`      | User   | —                   | `UserCar[]`         |
| Add an own car      | POST   | `/users/me/cars`      | User   | `UserCarInput`      | `UserCar`           |
| Update an own car   | PATCH  | `/users/me/cars/:id`  | User   | `UserCarInput`      | `UserCar`           |
| Delete an own car   | DELETE | `/users/me/cars/:id`  | User   | —                   | 204                 |

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
