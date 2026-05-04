# AGENTS.md

# RideShare Prototype · SvelteKit + Tailwind CSS · WebStorm

Read it in full before generating, editing, or scaffolding any code in this project.

---

## Project Context

This is the **frontend** of a minimalist ride-sharing prototype:

- **SvelteKit** (latest) — routing, layouts, server hooks, form actions
- **Svelte 5** — using Runes exclusively
- **Tailwind CSS** (latest) — utility-first styling, no UI component libraries
- **Java 25 / Spring Boot 4** — separate backend, REST API, runs on `http://localhost:8080` by default

For project structure and layer conventions, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Commands

```bash
npm run dev       # dev server — http://localhost:5173
npm run build     # production build
npm run preview   # preview production build locally
npm run check     # svelte-check: TypeScript + Svelte type errors
npm run lint      # ESLint
```

**After every change**, run `npm run check` to catch type errors before committing.
**Before opening a PR**, both `npm run check` and `npm run lint` must pass.

---

## Agent Permissions

### Allowed without asking

- Read any file, run `npm run check` and `npm run lint`
- Add or edit files under `src/`
- Add new routes under `src/routes/`
- Add new components under `src/lib/components/`

### Ask first

- Adding or changing dependencies in `package.json`
- Adding new environment variables to `.env`
- Modifying `hooks.server.ts`, `svelte.config.js`, or `vite.config.ts`
- Changing the API client in `src/lib/api/client.ts`

### Never

- Commit secrets or credentials of any kind
- Use `git push` without being explicitly asked
- Create test files, spec files, or test config — see "Never Generate" below
- Create `.css` files or add `<style>` blocks unless Tailwind cannot express the style

---

## Non-Negotiable

These rules override everything else. Violating any of them is always wrong, regardless of context.

1. **Strict TypeScript.** Always use `<script lang="ts">` in Svelte components and `.ts` for utility files.
2. **No tests.** Never generate `*.test.ts`, `*.spec.ts`, `vitest.config.*`, or `__tests__/` directories.
3. **No raw `fetch` in components or stores.** Every HTTP call goes through `src/lib/api/client.ts`.
4. **No hard-coded backend URLs.** Always read from: `import { PUBLIC_API_URL } from '$env/static/public'`.
5. **No `Authorization` header.** The JWT cookie is sent automatically via `credentials: 'include'`. Never construct a `Bearer` header.

---

## Authentication & Security — Intentional Design Decisions

> These choices may look unusual. They are deliberate — do not "fix" them.

- **JWT is in an HTTP-only cookie, not `localStorage`.** It is set and cleared by the Spring Boot backend. The frontend never reads or writes it directly.
- **No `Authorization: Bearer` header.** The cookie travels automatically with every request because `client.ts` uses `credentials: 'include'`. Adding a header would be redundant and wrong.
- **CSRF is not handled client-side.** The backend manages this. Do not add CSRF tokens to requests.
- **The Vite dev proxy forwards `/api` requests to `:8080`.** In development, you do not need the full `http://localhost:8080` prefix — the proxy handles it. Do not remove or work around the proxy in `vite.config.ts`.
- **Login and logout are server-side form actions**, not client-side API calls. This is intentional — it keeps the cookie lifecycle under server control. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the auth flow.

---

## Git Workflow

- Branch naming: `feature/<short-description>`, `fix/<short-description>`
- Commit messages: imperative mood, present tense — e.g. `Add ride card component`, not `Added`
- Every commit must pass `npm run check`
- Every PR must pass `npm run check` and `npm run lint`
- Do not squash or force-push without being asked

---

## Adding a New Reusable Component

Generate `src/lib/components/<Domain>/<Name>.svelte` following this shape:

```svelte
<script lang="ts">
	let { prop1, prop2 = 'default' }: { prop1: string; prop2?: string } = $props();
</script>

<div class="...tailwind classes...">
	<!-- markup -->
</div>
```

- Props via `$props()`, always strongly typed with a destructuring type annotation — not `$props<T>()`
- Tailwind classes only — no `style` attributes, no `<style>` block unless Tailwind genuinely cannot express the style
- No internal API calls — components receive data as props; pages and load functions fetch data

For full Svelte 5 patterns, naming conventions, and formatting rules, see [`docs/CODESTYLE.md`](docs/CODESTYLE.md).
For the full REST API contract, see [`docs/API.md`](docs/API.md).

---

## Never Generate (unless explicitly instructed)

- Test files of any kind (`*.test.ts`, `*.spec.ts`, `vitest.config.*`, `__tests__/`)
- Storybook or component playground files
- Docker, CI/CD, or deployment configuration
- Custom `.css` files (use Tailwind utilities instead)
- A `jsconfig.json` or `tsconfig.json` unless the project does not already have one

---

## Accessibility

- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`
- Icon-only buttons must have `aria-label`
- All interactive elements must be keyboard-reachable — no `div` click handlers without `role` and `tabindex`
- Color contrast must meet WCAG AA: 4.5:1 for body text, 3:1 for large text and UI components

---

## Comments

- Comment the **why**, never the **what**
- Prefer self-documenting names over comments that restate the code
- A comment above a `$effect` is appropriate if the side effect's trigger is not obvious
