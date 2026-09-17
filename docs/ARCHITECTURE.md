# Architecture

## Project Structure

```
project-root/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── auth.ts          # Auth API endpoints
│   │   │   ├── client.ts        # Base fetch wrapper — credentials:include, error shaping
│   │   │   └── users.ts         # getUser, updateMe
│   │   ├── components/
│   │   │   ├── account/         # Account-related components (PascalCase)
│   │   │   │   ├── CarsSection.svelte
│   │   │   │   ├── ProfileSection.svelte
│   │   │   │   ├── ReviewsSection.svelte
│   │   │   │   └── UserInfoSection.svelte
│   │   │   └── ui/              # Shared UI components
│   │   │       └── ConfirmationModal.svelte
│   │   ├── i18n/
│   │   │   └── translations.ts
│   │   ├── stores/
│   │   │   ├── auth.svelte.ts   # Authentication store (Svelte 5)
│   │   │   └── i18n.svelte.ts   # Internationalization store
│   │   ├── types/
│   │   │   └── user.ts          # User type definitions
│   │   └── index.ts
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout
│   │   ├── +page.svelte         # Home / landing
│   │   ├── +page.ts             # Root page load
│   │   ├── (app)/               # Authenticated routes group
│   │   │   ├── +layout.svelte   # App layout with nav
│   │   │   ├── +layout.ts       # App layout load with auth check
│   │   │   ├── account/
│   │   │   │   ├── +page.server.ts   # Auth guard for account
│   │   │   │   ├── +page.svelte      # User account page
│   │   │   │   └── +page.ts          # Account page load
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.ts
│   │   │   ├── publish/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.ts
│   │   │   ├── rides/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.ts
│   │   │   └── users/
│   │   │       └── [id]/
│   │   │           ├── +page.svelte
│   │   │           └── +page.ts
│   │   └── (auth)/              # Authentication routes group
│   │       ├── +layout.svelte
│   │       ├── login/
│   │       │   └── +page.svelte
│   │       └── register/
│   │           └── +page.svelte
│   ├── app.css                  # @tailwind directives
│   ├── app.d.ts                 # App type definitions
│   └── app.html
├── static/
│   └── favicon.png
├── .env                         # PUBLIC_API_URL=http://localhost:8080
├── eslint.config.js
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts               # Dev proxy: /api → Spring Boot :8080
```

---

## Authentication Flow

The JWT is issued by Spring Boot and stored in an **HTTP-only cookie**. Login and logout are always handled **server-side** via SvelteKit form actions — not client-side API calls. This keeps the cookie lifecycle under server control.

### Responsibility map

| File                                 | Responsibility                                                              |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `hooks.server.ts`                    | Reads cookie, decodes JWT, sets `event.locals.user` — runs on every request |
| `+layout.server.ts`                  | Passes `locals.user` to the client as page load data                        |
| `+layout.svelte`                     | Writes `data.user` into the `auth.svelte.ts` store                          |
| `src/lib/stores/auth.svelte.ts`      | Holds decoded user payload or `null` — never fetches or reads cookies       |
| `+page.server.ts` (protected routes) | Checks `locals.user`, redirects to `/login` if null                         |

### Form action pattern

Use SvelteKit `fail()` for 400 errors and `<form use:enhance>` on the client.

**Server (`+page.server.ts`):**

```ts
import { fail, redirect } from '@sveltejs/kit';
import { post } from '$lib/api/client';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		try {
			await post('/rides', payload);
		} catch (err) {
			if (err.status === 400) return fail(400, { errors: err.body.errors });
			return fail(500, { message: 'Server error' });
		}
		throw redirect(303, '/dashboard');
	}
};
```

**Client (`+page.svelte`):**

```svelte
<form method="POST" use:enhance>
	<!-- form fields -->
	<button type="submit">Submit</button>
</form>
```

### Route protection

Protected routes live under `(app)/`. Each protected page has a `+page.server.ts` that checks `locals.user` and redirects unauthenticated users to `/login`. Do not implement client-side auth guards — the server load function is the authoritative check.

## My Rides and passenger cancellation

Both `/my-rides` and `/my-rides/past` live under `(app)/` with server auth guards.
They fetch the same `GET /rides/me` response on mount through `src/lib/api/rides.ts`.

| Layer                                            | Responsibility                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `src/lib/types/ride.ts`                          | Four-array `MyRidesResponse`; `RideStatus` is `ACTIVE` / `CANCELLED`                    |
| `src/routes/(app)/my-rides/+page.svelte`         | Active Upcoming, merged Cancelled, confirmation and cancellation/refetch                |
| `src/routes/(app)/my-rides/past/+page.svelte`    | Active Past only, using server history buckets                                          |
| `src/lib/rides/classification.svelte.ts`         | Shared view types, scheduled-end parsing, ongoing badge predicate and cancelled sorting |
| `src/lib/components/rides/BookedRideCard.svelte` | Passenger card and eligible cancel button; receives callback, never fetches             |
| `src/lib/components/rides/HostedRideCard.svelte` | Hosted schedule and status card                                                         |

### Buckets and navigation

The backend owns time classification: booking drop-off / hosted final-stop end determines
Upcoming (`end > now` or legacy null) versus Past (`now.minusMonths(1) <= end <= now`, inclusive).
Upcoming sorts start ASC and Past end DESC with ID ASC ties. The frontend preserves these orders
when filtering active entries; it does not independently reclassify the response by browser time.

Main Cancelled merges cancelled entries from both server buckets for the selected role, sorting
end DESC, null ends last, then booking/ride ID ASC. Past excludes cancellations. Backend response
mapping composes booking + ride status and normalizes legacy `INACTIVE` to `CANCELLED`.

Both pages initialize Booked/Hosted from `?role=hosted` (otherwise Booked); their Past/Back links
include the current `role=booked|hosted`. Role is UI state, not an API filter. Tab buttons change
local selection; they do not send a request or rewrite the URL themselves.

Cards show “On the way” when `start <= browser now < end`, within Upcoming. Missing schedule
values show unavailable text; no schedules are fabricated. This badge is presentation only.
There is no polling, focus refresh, or timer-driven reclassification; requests occur on mount,
explicit Retry, and successful cancellation.

### Cancellation flow

The Booked card offers cancellation only for active Upcoming entries with a known future pickup.
The page opens `ConfirmationModal`, guards duplicate submission with `cancelling`, calls
`cancelBooking(bookingId)`, then explicitly reloads My Rides after 204. It does not optimistically
restore seats or move cards. Cancellation errors show an alert; reload errors use the page retry state.
Backend time/ownership checks remain authoritative if the page becomes stale.

See [API cancellation contract](API.md#passenger-cancellation) for owner-only 404, idempotent 204,
and expiry 409 responses.

No frontend automated tests, test configuration, or test dependencies are introduced for this
feature. Type/lint checks and manual validation evidence belong to the implementation handoff.

---

## Reviews

`src/lib/api/reviews.ts` is the only review transport, and it goes through the shared `client.ts`
wrapper like every other call. Types live in `src/lib/types/review.ts`; the review namespace in
`translations.ts` holds the copy for both languages.

The client never decides who may be reviewed. `GET /reviews/me/eligibility` and `GET /reviews/me`
report the counterparts a member shared a ride with, whether a review already exists, and whether
`canSubmit` still allows writing. `ReviewsToWrite` renders that list as-is and opens `ReviewForm`,
which posts to `/reviews` and reloads after success. This means the same component serves both
"write" and "update", matching the lifetime one-review-per-counterpart rule.

Two surfaces read reviews and neither is writable:

- `ReviewsSection` renders a `RatingSummary` plus published reviews, and is used by the account page
  and public profiles. Public profiles pass `showModeration` when the signed-in member is an admin,
  which reveals hide/restore controls backed by `/admin/reviews/{id}/hide` and `/restore`. Hiding
  removes the card locally and re-hides on reload because the server no longer returns it publicly.
- Search results, Ride details, and booked cards keep using the driver rating fields already present
  in their payloads. A null average renders as "No reviews yet" through `RatingSummary`; it is never
  shown as a zero score.

`/my-rides/past` shows `ReviewsToWrite` for the member's outstanding feedback, covering both
directions, so a driver reviews their passengers and a passenger reviews their driver from the same
list. The account page shows it alongside received reviews.

After a successful submit, `ReviewsToWrite` shows a transient confirmation ("Your review has been
recorded") in place of the form and immediately records a per-cycle dismissal in `localStorage`
(`reviews.dismissed.v1`, keyed `targetUserId:dropoffAt|rideId`, capped at 200 keys). The submitted
entry therefore never reappears on that browser — not after reload, and not on the account page,
which shares the component. The confirmation renders outside the writable-filtered list because the
dismissal removes the entry from that list in the same tick it is written. This is presentation
state only: the backend still reports the review as writable (`canSubmit` stays true until
publication or lock), so the server, not storage, decides what may be edited on another browser or
after storage is cleared.

No frontend automated tests are introduced for reviews either. `npm run check`, `npm run lint`, and
`npm run build` are the required checks.
