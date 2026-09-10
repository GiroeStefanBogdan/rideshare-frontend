# REST API Contract

These are the **only endpoints that exist**. Do not invent paths, methods, or query parameters not listed here.

The backend runs on `http://localhost:8080` by default. In development, the Vite proxy forwards `/api` requests automatically — you do not need to prefix URLs with the full origin.

All requests must go through the API client wrapper:

```ts
import { get, post, put, del } from '$lib/api/client';
```

---

## Authentication

| Action       | Method | Path           | Request body          | Response                         | Cookie       |
| ------------ | ------ | -------------- | --------------------- | -------------------------------- | ------------ |
| Register    | POST   | `/register`    | `UserRegistrationRequest`             | `User`           | —              |
| Email login | POST   | `/login`       | `{ email, password, rememberMe }`      | `{ token, user }` | Sets `token`   |
| Logout      | POST   | `/auth/logout` | —                                      | 204              | Clears `token` |

---

## Rides — `/rides`

| Action         | Method | Path         | Request body | Response |
| -------------- | ------ | ------------ | ------------ | -------- |
| Get one ride   | GET    | `/rides/:id` | —            | `Ride`   |
| Publish a ride | POST   | `/rides`     | `PublishRideRequest` | 201 `{ rideId }` |
| Delete a ride  | DELETE | `/rides/:id` | —            | 204      |
| Search rides   | POST   | `/rides/search` | `RideSearchRequest` | `RideSearchResult[]` |
| Reserve seats  | POST   | `/rides/:id/reserve` | `ReserveRideRequest` | 201 `{ bookingId }` |

`PublishRideRequest` contains `seatsTotal` (1–4), optional `carId`, and 2–7 ordered `rideStops`.
Each stop contains `id`, `type`, `stopOrder`, `departsAt`, and an increasing
`cumulativePricePerSeat`; the Origin value is `0`.

---

## Reviews

> Planned feature: review endpoints are not implemented yet. The frontend displays an unavailable state until this contract is delivered.

## Users — `/users`

| Action             | Method | Path         | Request body | Response |
| ------------------ | ------ | ------------ | ------------ | -------- |
| Get any profile    | GET    | `/users/:id` | —            | `User`   |
| Get own profile    | GET    | `/users/me`  | —            | `User`   |
| Update own profile | PATCH  | `/users/me`  | `UserInput`  | `User`   |
| Delete own account | DELETE | `/users/me`  | —            | 204      |

---

## Error Handling

The backend returns structured error bodies. The client wrapper in `client.ts` shapes these into a consistent error object before throwing. Always catch by checking `err.status`:

```ts
try {
	await post('/rides', payload);
} catch (err) {
	if (err.status === 400) return fail(400, { errors: err.body.errors });
	if (err.status === 401) redirect(303, '/login');
	return fail(500, { message: 'Server error' });
}
```

Do not inspect raw `Response` objects — use the shaped error from the client.
