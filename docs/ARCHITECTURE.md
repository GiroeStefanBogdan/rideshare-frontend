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

| File | Responsibility |
|---|---|
| `hooks.server.ts` | Reads cookie, decodes JWT, sets `event.locals.user` — runs on every request |
| `+layout.server.ts` | Passes `locals.user` to the client as page load data |
| `+layout.svelte` | Writes `data.user` into the `auth.svelte.ts` store |
| `src/lib/stores/auth.svelte.ts` | Holds decoded user payload or `null` — never fetches or reads cookies |
| `+page.server.ts` (protected routes) | Checks `locals.user`, redirects to `/login` if null |

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
