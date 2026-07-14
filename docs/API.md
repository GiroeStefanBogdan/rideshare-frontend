# REST API Contract

These are the **only endpoints that exist**. Do not invent paths, methods, or query parameters not listed here.

The backend runs on `http://localhost:8080` by default. In development, the Vite proxy forwards `/api` requests automatically — you do not need to prefix URLs with the full origin.

All requests must go through the API client wrapper:

```ts
import { get, post, put, del } from '$lib/api/client';
```

---

## Auth — `/auth`

| Action       | Method | Path           | Request body          | Response                         | Cookie       |
| ------------ | ------ | -------------- | --------------------- | -------------------------------- | ------------ |
| Email login  | POST   | `/auth/login`  | `{ email, password }` | `{ id, name, email, avatarUrl }` | Sets `jwt`   |
| Google login | POST   | `/auth/google` | `{ idToken }`         | `{ id, name, email, avatarUrl }` | Sets `jwt`   |
| Logout       | POST   | `/auth/logout` | —                     | 204                              | Clears `jwt` |

---

## Rides — `/rides`

| Action         | Method | Path         | Request body | Response |
| -------------- | ------ | ------------ | ------------ | -------- |
| List all rides | GET    | `/rides`     | —            | `Ride[]` |
| Get one ride   | GET    | `/rides/:id` | —            | `Ride`   |
| Post a ride    | POST   | `/rides`     | `RideInput`  | `Ride`   |
| Delete a ride  | DELETE | `/rides/:id` | —            | 204      |
| My rides       | GET    | `/rides/me`   | —            | `MyRidesResponse` |

`GET /rides/me` returns four independently sorted lists: `upcomingBookings`, `pastBookings`,
`upcomingHostedRides`, and `pastHostedRides`. Booking entries contain the booked stops,
seat count, total RON price, driver summary, and derived `ACTIVE`/`INACTIVE` status.
Hosted entries contain ordered stops with departure time, available seats, and per-seat price.

`POST /rides` accepts ordered `rideStops`; each stop supplies `departsAt` and `price`.
The first stop determines the ride departure and base price. Stop order, increasing times,
and decreasing prices ending at zero are validated by the backend.

---

## Reviews — `/rides/:id/reviews`

| Action                | Method | Path                 | Request body  | Response   |
| --------------------- | ------ | -------------------- | ------------- | ---------- |
| List reviews for ride | GET    | `/rides/:id/reviews` | —             | `Review[]` |
| Post a review         | POST   | `/rides/:id/reviews` | `ReviewInput` | `Review`   |

---

## Users — `/users`

| Action             | Method | Path         | Request body | Response |
| ------------------ | ------ | ------------ | ------------ | -------- |
| Get any profile    | GET    | `/users/:id` | —            | `User`   |
| Update own profile | PUT    | `/users/me`  | `UserInput`  | `User`   |

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
