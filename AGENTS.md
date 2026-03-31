# AGENTS.md — GitHub Copilot Agent Mode Instructions

# RideShare Prototype · SvelteKit + Tailwind CSS · WebStorm

This file is the authoritative context document for **GitHub Copilot Agent mode (`@workspace`)**.
Read it in full before generating, editing, or scaffolding any code in this project.

---

## Project Context

This is the **frontend** of a minimalist ride-sharing prototype:

- **SvelteKit** (latest) — routing, layouts, server hooks, form actions
- **Tailwind CSS** (latest) — utility-first styling, no UI component libraries
- **Java 25 / Spring Boot 4** — separate backend, REST API, runs on `http://localhost:8080` by default

Core features: email login, Google OAuth login, posting rides, browsing rides, user profiles, reviews.
There is **no GPS, no maps, and no real-time tracking** at this stage.

---

## Non-Negotiables

These rules override everything else. Violating any of them is always wrong, regardless of context.

1. **No tests.** Never generate `*.test.js`, `*.spec.js`, `vitest.config.*`, or `__tests__/` directories.
2. **No production builds.** Never suggest `vite build`, `svelte-kit build`, or CI/CD steps.
3. **No `localStorage` / `sessionStorage` for auth.** The JWT lives in an HTTP-only cookie. Never suggest browser
   storage for tokens.
4. **No raw `fetch` in components or stores.** Every HTTP call goes through `src/lib/api/client.js`.
5. **No hard-coded backend URLs.** Always read from `import.meta.env.VITE_API_BASE_URL`.
6. **No `Authorization` header.** The cookie is sent automatically via `credentials: 'include'`. Never construct a
   `Bearer` header.

---

## Agent Mode Usage (WebStorm)

This project uses **Copilot Agent mode (`@workspace`) as the primary coding interface**. Agent mode has full access to
the workspace index, so prompts can and should reference filenames, paths, and existing patterns directly.

### Effective prompt patterns

Always be explicit about which files to create or modify and which existing file to pattern-match against:

```
"Create the reviews route at src/routes/rides/[id]/+page.svelte and its
 +page.server.js, following the same auth guard pattern as rides/+page.server.js"

"Add src/lib/api/reviews.js following the same shape as src/lib/api/rides.js"

"Refactor RideCard.svelte to use Svelte 5 runes — replace export let with $props()
 and $: reactive statements with $derived()"

"Add loading and error state to the fetch in rides/+page.svelte using the
 pattern already in profile/+page.svelte"
```

### How Agent resolves ambiguity

When a prompt is ambiguous, Agent mode will read existing files for patterns before generating. To help it resolve
correctly:

- Keep `src/lib/api/rides.js` and `src/lib/api/client.js` as the canonical reference files — they are the source of
  truth for API shape.
- Keep `src/routes/rides/+page.server.js` as the canonical reference for auth-guarded server load functions.
- Keep one component that already handles loading/error state open — Agent will replicate that pattern.

If Agent generates something that conflicts with these guidelines, add a clarifying comment at the top of the target
file and re-run the prompt.

---

## Project Structure

```
project-root/
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts      # Base fetch wrapper — credentials:include, error shaping
│   │   │   └── users.ts       # getUser, updateMe
│   │   ├── components/
│   │   │   └── account/       # Account-related components (PascalCase)
│   │   │       ├── CarsSection.svelte
│   │   │       ├── ProfileSection.svelte
│   │   │       ├── ReviewsSection.svelte
│   │   │       └── UserInfoSection.svelte
│   │   ├── i18n/
│   │   │   └── translations.ts
│   │   ├── stores/
│   │   │   ├── auth.svelte.ts # Authentication store
│   │   │   └── i18n.svelte.ts # Internationalization store
│   │   └── types/
│   │       └── user.ts        # User type definitions
│   ├── routes/
│   │   ├── +layout.svelte         # Root layout
│   │   ├── +page.svelte           # Home / landing
│   │   ├── +page.ts               # Root page load
│   │   ├── (app)/                 # Authenticated routes group
│   │   │   ├── +layout.svelte     # App layout with nav
│   │   │   ├── +layout.ts         # App layout load with auth check
│   │   │   ├── account/
│   │   │   │   ├── +page.svelte   # User account page
│   │   │   │   ├── +page.ts       # Account page load
│   │   │   │   └── +page.ts # Auth guard for account
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte   # Dashboard page
│   │   │   │   └── +page.ts       # Dashboard page load
│   │   │   └── users/
│   │   │       └── [id]/
│   │   │           ├── +page.svelte # User profile page
│   │   │           └── +page.ts     # User profile load
│   │   └── (auth)/                 # Authentication routes group
│   │       ├── +layout.svelte     # Auth layout
│   │       ├── login/
│   │       │   └── +page.svelte   # Login page
│   │       └── register/
│   │           └── +page.svelte   # Register page
│   ├── app.d.ts                   # App type definitions
│   ├── app.html
│   └── app.css                    # @tailwind directives
├── static/
│   └── favicon.png
├── .env                           # PUBLIC_API_URL=http://localhost:8080
├── eslint.config.js
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts                 # Dev proxy: /api → Spring Boot :8080
└── AGENTS.md
```

---

## Svelte Code Style

### Component file order (always)

```svelte
<script>
  // 1. imports
  // 2. props  ($props() or export let)
  // 3. state  ($state / $derived / stores)
  // 4. effects / lifecycle ($effect / onMount)
  // 5. event handlers and local functions
</script>

<!-- markup -->

<style>
  /* only when Tailwind alone cannot express the style */
</style>
```

### Svelte 5 runes (preferred)

| Use this                  | Not this                 |
|---------------------------|--------------------------|
| `let { prop } = $props()` | `export let prop`        |
| `let x = $state(0)`       | `let x = 0`              |
| `let y = $derived(x * 2)` | `$: y = x * 2`           |
| `$effect(() => { ... })`  | `onMount(() => { ... })` |

Fall back to Svelte 4 syntax only if the installed Svelte version is below 5.

### Naming conventions

| Artifact           | Convention      | Example                |
|--------------------|-----------------|------------------------|
| Component files    | PascalCase      | `RideCard.svelte`      |
| Route directories  | lowercase-kebab | `rides/post/`          |
| JS utility files   | camelCase       | `formatDate.js`        |
| Exported functions | camelCase       | `getRides`, `postRide` |
| Store variables    | camelCase       | `currentUser`          |

### Formatting

- 2-space indentation everywhere
- Single quotes in JS; double quotes in HTML attributes and Svelte templates
- `const` by default; `let` only when a variable is reassigned; never `var`

### Tailwind

- Utilities in markup only — avoid `@apply` unless a pattern is genuinely reused in 10+ places
- Class order per element: **structure → spacing → typography → colour → interactive state**
- Mobile-first; `sm:` `md:` `lg:` for responsive variants

---

## Backend Integration

### `src/lib/api/client.js` — canonical fetch wrapper

```js
// src/lib/api/client.js
const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

async function request(path, options = {}) {
	const res = await fetch(`${BASE}${path}`, {
		...options,
		credentials: 'include',            // sends the HTTP-only JWT cookie automatically
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		const err = new Error(body.message ?? res.statusText);
		err.status = res.status;
		throw err;
	}

	return res.status === 204 ? null : res.json();
}

export const get = (path) => request(path);
export const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
export const del = (path) => request(path, { method: 'DELETE' });
```

### Full REST API contract

These are the only endpoints that exist. Do not invent paths or methods.

#### Auth — `/auth`

| Action       | Method | Path           | Request body          | Response                         | Cookie       |
|--------------|--------|----------------|-----------------------|----------------------------------|--------------|
| Email login  | POST   | `/auth/login`  | `{ email, password }` | `{ id, name, email, avatarUrl }` | Sets `jwt`   |
| Google login | POST   | `/auth/google` | `{ idToken }`         | `{ id, name, email, avatarUrl }` | Sets `jwt`   |
| Logout       | POST   | `/auth/logout` | —                     | 204                              | Clears `jwt` |

#### Rides — `/rides`

| Action         | Method | Path         | Request body | Response |
|----------------|--------|--------------|--------------|----------|
| List all rides | GET    | `/rides`     | —            | `Ride[]` |
| Get one ride   | GET    | `/rides/:id` | —            | `Ride`   |
| Post a ride    | POST   | `/rides`     | `RideInput`  | `Ride`   |
| Delete a ride  | DELETE | `/rides/:id` | —            | 204      |

**`Ride` shape:**

```js
{
	id: string,
		driverId
:
	string,
		driverName
:
	string,
		origin
:
	string,
		destination
:
	string,
		departureTime
:
	string,   // ISO 8601
		seatsAvailable
:
	number,
		pricePerSeat
:
	number,    // in cents
		notes
:
	string | null,
		createdAt
:
	string        // ISO 8601
}
```

**`RideInput` shape (POST body):**

```js
{
	origin: string,
		destination
:
	string,
		departureTime
:
	string,   // ISO 8601
		seatsAvailable
:
	number,
		pricePerSeat
:
	number,    // in cents
		notes ? : string
}
```

#### Reviews — `/rides/:id/reviews`

| Action                | Method | Path                 | Request body  | Response   |
|-----------------------|--------|----------------------|---------------|------------|
| List reviews for ride | GET    | `/rides/:id/reviews` | —             | `Review[]` |
| Post a review         | POST   | `/rides/:id/reviews` | `ReviewInput` | `Review`   |

**`Review` shape:**

```js
{
	id: string,
		rideId
:
	string,
		authorId
:
	string,
		authorName
:
	string,
		rating
:
	number,          // 1–5
		comment
:
	string | null,
		createdAt
:
	string        // ISO 8601
}
```

**`ReviewInput` shape:**

```js
{
	rating: number,          // 1–5, required
		comment ? : string
}
```

#### Users — `/users`

| Action             | Method | Path         | Request body | Response |
|--------------------|--------|--------------|--------------|----------|
| Get any profile    | GET    | `/users/:id` | —            | `User`   |
| Update own profile | PUT    | `/users/me`  | `UserInput`  | `User`   |

**`User` shape:**

```js
{
	id: string,
		name
:
	string,
		email
:
	string,
		avatarUrl
:
	string | null,
		bio
:
	string | null,
		createdAt
:
	string        // ISO 8601
}
```

**`UserInput` shape:**

```js
{
	name ? : string,
		bio ? : string,
		avatarUrl ? : string
}
```

### HTTP status codes — how to handle them

| Status | Meaning         | Frontend action                                              |
|--------|-----------------|--------------------------------------------------------------|
| 200    | OK              | Use response body                                            |
| 201    | Created         | Use response body                                            |
| 204    | No content      | Return `null`, no body parsing                               |
| 400    | Bad request     | Show field-level validation errors from `body.errors`        |
| 401    | Unauthenticated | Redirect to `/login` — cookie is missing or expired          |
| 403    | Forbidden       | Show inline error — user is authenticated but not authorised |
| 404    | Not found       | Show a "not found" message in place, do not redirect         |
| 500    | Server error    | Show a generic error message, log to console                 |

Never conflate 401 and 403. Never redirect on 403.

### Error handling pattern in components

Every component that calls an API function must handle loading and error state explicitly:

```svelte
<script>
  import { getRides } from '$lib/api/rides.js';
  import { goto } from '$app/navigation';

  let rides   = $state([]);
  let loading = $state(true);
  let error   = $state(null);

  $effect(() => {
    getRides()
      .then(data  => (rides = data))
      .catch(err  => {
        if (err.status === 401) goto('/login');
        else error = err.message;
      })
      .finally(() => (loading = false));
  });
</script>

{#if loading}
  <p>Loading…</p>
{:else if error}
  <p class="text-red-600">{error}</p>
{:else}
  <!-- render rides -->
{/if}
```

---

## Authentication Flow

The JWT is issued by Spring Boot and stored in an **HTTP-only cookie**. Never suggest an alternative.

```
Browser                    SvelteKit server              Spring Boot
  │                                                            │
  │── POST /auth/login ────────────────────────────────────>  │
  │<─ Set-Cookie: jwt=<token>; HttpOnly; SameSite=Lax ──────  │
  │                                                            │
  │── Any authenticated request ───────────────────────────>  │
  │   (browser attaches cookie automatically)                  │
  │                                                            │
  │   hooks.server.js:                                         │
  │     token = event.cookies.get('jwt')                       │
  │     event.locals.user = decodeJwt(token) | null            │
  │                                                            │
  │   +layout.server.js:                                       │
  │     return { user: locals.user }                           │
  │                                                            │
  │   +layout.svelte:                                          │
  │     currentUser.set(data.user)                             │
```

### Key files and their single responsibility

| File                                 | Responsibility                                                              |
|--------------------------------------|-----------------------------------------------------------------------------|
| `hooks.server.js`                    | Reads cookie, decodes JWT, sets `event.locals.user` — runs on every request |
| `+layout.server.js`                  | Passes `locals.user` to the client as page load data                        |
| `+layout.svelte`                     | Writes `data.user` into the `currentUser` store                             |
| `src/lib/stores/user.js`             | Holds decoded user payload or `null` — never fetches or reads cookies       |
| `+page.server.js` (protected routes) | Checks `locals.user`, redirects to `/login` if null                         |

Login and logout are always handled **server-side** (form actions or `+server.js` endpoints). The cookie is set and
cleared by Spring Boot and never touched by client JavaScript.

---

## Scaffolding Rules

When asked to add any feature, Agent mode must generate the **complete set of files** for that feature. Never produce
just one file when multiple are needed.

### Adding a new route

Always generate together:

```
src/routes/<name>/
  +page.svelte         ← UI, Tailwind classes, loads from page data
  +page.server.js      ← server load: auth guard + initial data fetch via api/
```

Auth guard pattern for `+page.server.js`:

```js
import { redirect } from '@sveltejs/kit';

export function load({ locals }) {
	if (!locals.user) throw redirect(302, '/login');
	return {};    // add data fetching here as needed
}
```

### Adding a new API resource

Generate `src/lib/api/<resource>.js` following this exact shape:

```js
import { get, post, put, del } from './client.js';

export const get
<
Resource > s = () => get('/<resources>');
export const get
<
Resource > = (id) => get(`/<resources>/${id}`);
export const post
<
Resource > = (body) => post('/<resources>', body);
export const delete
<Resource>= (id) => del(`/
	<resources>/${id}`);
```

Only export the functions that correspond to endpoints that actually exist in the contract above.

### Adding a new reusable component

Generate `src/lib/components/<Name>.svelte` following this shape:

```svelte
<script>
  let { prop1, prop2 = 'default' } = $props();
</script>

<div class="...tailwind classes...">
  <!-- markup -->
</div>
```

- Props via `$props()` (Svelte 5) or `export let` (Svelte 4 fallback)
- Tailwind classes only — no `style` attributes, no `<style>` block unless unavoidable
- No internal API calls — components receive data as props; pages fetch data

### Never generate (unless explicitly instructed)

- Test files of any kind
- Storybook or component playground files
- Docker, CI/CD, or deployment configuration
- Custom `.css` files (use Tailwind utilities instead)
- A `jsconfig.json` or `tsconfig.json` unless the project doesn't already have one

---

## Accessibility

- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`
- Icon-only buttons must have `aria-label`
- All interactive elements must be keyboard-reachable (no `div` click handlers without `role` and `tabindex`)
- Colour contrast must meet WCAG AA: 4.5:1 for body text, 3:1 for large text and UI components

---

## Comments

- Only comment the **why**, never the **what**
- Prefer self-documenting names over comments that restate the code
- A comment above a `$effect` is appropriate if the side-effect's trigger is not obvious
