# Junie Guidelines — RideShare Prototype (Svelte + Tailwind CSS)

## Project Overview

A simple, minimalist ride-sharing web app prototype. Core features: Google login / email login, posting rides, user profiles, and reviews. No GPS tracking or maps at this stage.

---

## Project Structure

The project follows the standard SvelteKit conventions:

```
project-root/
├── src/
│   ├── lib/
│   │   ├── components/        # Reusable Svelte components (e.g. RideCard.svelte, ReviewCard.svelte)
│   │   ├── stores/            # Svelte stores for shared state (e.g. user.js, rides.js)
│   │   └── utils/             # Pure helper functions (e.g. formatDate.js, validators.js)
│   ├── routes/                # SvelteKit file-based routing
│   │   ├── +layout.svelte     # Root layout (nav, auth guard wrapping)
│   │   ├── +layout.server.js  # Server layout load — reads locals.user, passes to client
│   │   ├── +page.svelte       # Home / landing page
│   │   ├── login/
│   │   │   └── +page.svelte   # Login page (email + Google OAuth)
│   │   ├── rides/
│   │   │   ├── +page.svelte   # Browse / list rides
│   │   │   ├── post/
│   │   │   │   └── +page.svelte  # Post a new ride
│   │   │   └── [id]/
│   │   │       └── +page.svelte  # Single ride detail + reviews
│   │   └── profile/
│   │       ├── +page.svelte   # Authenticated user's own profile
│   │       └── [userId]/
│   │           └── +page.svelte  # Public profile view
│   ├── hooks.server.js        # Reads JWT cookie on every request, populates event.locals.user
│   ├── app.html               # HTML shell
│   └── app.css                # Global styles (Tailwind directives)
├── static/                    # Static assets (favicon, images)
├── tailwind.config.js         # Tailwind configuration
├── svelte.config.js           # SvelteKit configuration
├── vite.config.js             # Vite configuration
└── package.json
```

---

## Tests

**Do not write or run tests at this stage.**

Testing will be introduced in a later phase. Skip any test generation, test file creation, or test runner configuration entirely. Do not create `*.test.js`, `*.spec.js`, or any `__tests__/` directories.

---

## Build

**Do not run the build before submitting.** Development mode (`vite dev`) is sufficient. Do not run `vite build` or `svelte-kit build` as part of the workflow. Assume the dev server starts cleanly with:

```bash
npm run dev
```

---

## Code Style & Svelte Best Practices

### General

- Use **SvelteKit** (not plain Svelte) for routing, layouts, and server-side utilities.
- Follow the **default SvelteKit project structure** as scaffolded by `npm create svelte@latest`. Do not invent custom structures.
- Use **ES modules** throughout (`import`/`export`). No CommonJS (`require`).
- Prefer **`const`** over `let` where values are not reassigned. Never use `var`.
- Use **2-space indentation**.
- **Single quotes** for strings in JavaScript/TypeScript. Double quotes in HTML attributes and Svelte templates (standard HTML convention).

### Svelte Components

- One component per `.svelte` file. Name files in **PascalCase** (e.g. `RideCard.svelte`).
- Keep the standard Svelte single-file component order:
  1. `<script>` block
  2. Markup (HTML)
  3. `<style>` block (only when Tailwind alone is insufficient)
- Use **`$props()`** (Svelte 5 runes syntax) for component props if using Svelte 5; otherwise use `export let` (Svelte 4).
- Prefer **`$state()`** and **`$derived()`** runes for reactive declarations in Svelte 5. In Svelte 4, use `$:` reactive declarations sparingly and clearly.
- Use **Svelte stores** (`writable`, `readable`, `derived` from `svelte/store`) for shared cross-component state (e.g. currently logged-in user, ride list).
- Avoid deeply nested component trees. Favour composition over inheritance.
- Extract logic that is not purely UI into `src/lib/utils/` as plain JS functions.

### Routing & Layouts

- Use SvelteKit's **file-based routing** exclusively. Do not configure custom routers.
- Use `+layout.svelte` for persistent UI (navigation bar, auth wrappers).
- Use `+page.svelte` for each route's content.
- Protect authenticated routes by checking `locals.user` inside `+layout.server.js` or individual `+page.server.js` `load` functions, and redirecting to `/login` with SvelteKit's `redirect` helper when the user is absent.

### Tailwind CSS

- Use **Tailwind utility classes** directly in markup. Avoid writing custom CSS unless a style cannot be achieved with Tailwind.
- Do not use `@apply` in component `<style>` blocks except for genuinely repeated, complex patterns (e.g. a shared button variant used in 10+ places).
- Keep the `tailwind.config.js` clean: extend the default theme sparingly. Only add custom colours, font families, or spacing values that the design system actually requires.
- Use Tailwind's **responsive prefixes** (`sm:`, `md:`, `lg:`) for layout breakpoints. Mobile-first by default.
- Use semantic class grouping in markup: structure → spacing → typography → colour → state (hover/focus/disabled). This order makes classes scannable.

### Authentication & JWT (Cookie-Based)

The JWT is stored in an **HTTP-only cookie** set by the server. This is the single source of truth for authentication. The following rules are strict:

**Never use `localStorage` or `sessionStorage` for the JWT.** Never read or write the cookie directly from client-side JavaScript — HTTP-only cookies are intentionally inaccessible to JS.

#### `hooks.server.js` — validate on every request

Use SvelteKit's server hook to read and decode the JWT cookie once per request, making the user available to all `load` functions via `event.locals`:

```js
// src/hooks.server.js
import { decodeJwt } from '$lib/utils/jwt.js'; // lightweight base64 decode, no crypto needed client-side

export async function handle({ event, resolve }) {
  const token = event.cookies.get('jwt'); // align cookie name with backend

  if (token) {
    try {
      const payload = decodeJwt(token);
      const isExpired = payload.exp && payload.exp * 1000 < Date.now();
      event.locals.user = isExpired ? null : payload;
    } catch {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
}
```

#### `+layout.server.js` — pass user to the client

```js
// src/routes/+layout.server.js
export function load({ locals }) {
  return { user: locals.user ?? null };
}
```

In `+layout.svelte`, receive `data.user` and write it into the `currentUser` store so all components can access it reactively without additional server calls.

#### Login & logout

Handle both **server-side only** — use SvelteKit form actions or `+server.js` endpoints. Never manage cookies in client-side `fetch` calls.

On **login success**, set the cookie with secure flags:

```js
// inside a +server.js or form action
event.cookies.set('jwt', token, {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // match backend token expiry
});
```

On **logout**, delete the cookie server-side:

```js
event.cookies.delete('jwt', { path: '/' });
```

Never attempt to delete or expire the cookie from the browser.

#### Client-side user store

`src/lib/stores/user.js` holds the decoded JWT payload (or `null`) as a Svelte writable store. It is populated from `+layout.server.js` load data — it never inspects cookies or calls `fetch` independently.

### State & Data

- Mock all backend data locally with static arrays or JSON files in `src/lib/` during this prototype phase. No real API calls are required yet.
- Auth state (`currentUser`) lives in `src/lib/stores/user.js`, hydrated from server `load` data.
- Keep store logic thin. Stores hold reactive state; business logic belongs in `src/lib/utils/`.

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `RideCard.svelte` |
| Route directories | lowercase-kebab | `rides/post/` |
| JS/TS files | camelCase | `formatDate.js` |
| Store variables | camelCase | `currentUser` |
| Tailwind config keys | camelCase or kebab | `brandGreen` |
| CSS custom properties | `--kebab-case` | `--color-brand` |

### Accessibility

- All interactive elements must be keyboard-accessible.
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<section>`, `<article>`).
- Add `aria-label` or visible text to icon-only buttons.
- Ensure colour contrast meets WCAG AA minimum (4.5:1 for normal text).

### Comments

- Write comments only where the **why** is not obvious from the code itself.
- Avoid restating what the code does in a comment. Prefer self-documenting variable and function names.

---

## Summary Checklist for Junie

- [x] Use SvelteKit file-based routing and default project structure
- [x] No tests — skip all test generation and configuration
- [x] No production build — `npm run dev` is sufficient
- [x] Svelte 5 runes syntax preferred (`$state`, `$props`, `$derived`); fall back to Svelte 4 patterns if the installed version requires it
- [x] Tailwind utility classes in markup; minimal custom CSS
- [x] Mock data only — no real backend or API calls at this stage
- [x] JWT is stored in an **HTTP-only cookie** — never in `localStorage` or `sessionStorage`
- [x] JWT cookie is never read or written from client-side JavaScript
- [x] `hooks.server.js` decodes the cookie on every request and sets `event.locals.user`
- [x] Auth state flows: server hook → `+layout.server.js` load → `+layout.svelte` → `currentUser` store
- [x] Login and logout are handled server-side (form actions or `+server.js`); cookies are set/cleared there only
- [x] 2-space indentation, single quotes in JS, double quotes in HTML attributes