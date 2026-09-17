# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## DrumBun My Rides

Authenticated `/my-rides` has Booked/Hosted tabs with active Upcoming and Cancelled sections.
Cancelled combines both server time buckets; `/my-rides/past` shows active history only.
The Past/Back links preserve the selected role with `?role=booked|hosted`.

Both pages use `GET /rides/me`, whose four arrays are classified by booking drop-off / hosted
final-stop time, not departure. Past includes both the calendar-month cutoff and now; legacy
null ends remain Upcoming. Wire status is `ACTIVE` / `CANCELLED`, with legacy compatibility
handled by the backend.

Passengers can confirm cancellation strictly before pickup. The page calls
`DELETE /rides/me/bookings/{bookingId}` and explicitly refetches on success. There is no polling,
focus refresh, or optimistic seat restoration. See the [API contract](docs/API.md#passenger-cancellation)
for owner-only 404, no-op 204, and expired cancellation 409 responses.

No frontend automated tests, test configuration, or test dependencies are introduced for this feature.
Application validation evidence belongs to the implementation handoff, not this documentation update.

## Documentation

- [Agent guide](AGENTS.md)
- [API contract](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md#my-rides-and-passenger-cancellation)
- [Domain glossary](CONTEXT.md)
- [Cancellation ADR](docs/adr/0003-use-explicit-cancelled-status.md)
