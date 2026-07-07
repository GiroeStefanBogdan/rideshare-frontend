# Code Style

## Component File Order

Always follow this order inside every `.svelte` file:

```svelte
<script lang="ts">
	// 1. imports
	// 2. props  (let { prop } = $props())
	// 3. state  ($state / $derived / stores)
	// 4. effects / lifecycle ($effect)
	// 5. event handlers and local functions
</script>

<!-- markup -->

<style>
	/* only when Tailwind alone cannot express the style */
</style>
```

---

## Svelte 5 Runes — Required Patterns

Svelte 4 patterns are not permitted. Use the Svelte 5 equivalent for everything.

| Use this                                      | Not this                         |
| --------------------------------------------- | -------------------------------- |
| `let { prop } = $props()`                     | `export let prop`                |
| `let x = $state(0)`                           | `let x = 0` (for reactive state) |
| `let y = $derived(x * 2)`                     | `$: y = x * 2`                   |
| `$effect(() => { ... })`                      | `onMount(() => { ... })`         |
| `let { onAction } = $props()` (callback prop) | `createEventDispatcher`          |
| `{#snippet mySnippet()}` and `{@render ...}`  | `<slot>` and `<slot name="...">` |

### Props typing

Always use a destructuring type annotation — not the generic `$props<T>()` syntax:

```ts
// correct
let { prop1, prop2 = 'default' }: { prop1: string; prop2?: string } = $props();

// wrong — not valid Svelte 5
let { prop1 } = $props<{ prop1: string }>();
```

### `$state` — use only for reactive variables

Only reach for `$state` when the variable needs to trigger UI updates. Plain `const`/`let` is fine for non-reactive values:

```ts
let count = $state(0); // reactive — drives UI
const label = 'Submit'; // non-reactive — plain const is correct
```

### `$effect` — comment non-obvious triggers

A comment above a `$effect` is appropriate when the reason it runs is not immediately clear from the dependencies:

```ts
// Re-validate form when the user's email changes server-side
$effect(() => {
	validateEmail(user.email);
});
```

---

## Naming Conventions

| Artifact           | Convention      | Example                |
| ------------------ | --------------- | ---------------------- |
| Component files    | PascalCase      | `RideCard.svelte`      |
| Route directories  | lowercase-kebab | `rides/post/`          |
| TS utility files   | camelCase       | `formatDate.ts`        |
| Exported functions | camelCase       | `getRides`, `postRide` |
| Store variables    | camelCase       | `currentUser`          |
| Domain sub-folders | lowercase       | `components/account/`  |

---

## Formatting

- **2-space indentation** everywhere (components, TS, config files)
- **Single quotes** in TypeScript; **double quotes** in HTML attributes and Svelte templates
- `const` by default; `let` only when a variable is reassigned or is `$state`/`$derived`; never `var`
- Max line length: **100 characters** (ESLint enforced)

---

## API Client Usage

All HTTP calls go through the custom wrapper in `src/lib/api/client.ts`. Never use raw `fetch` in components or stores.

```ts
import { get, post, put, del } from '$lib/api/client';

const ride = await get('/rides/123');
const newRide = await post('/rides', rideData);
```

The client automatically sets `credentials: 'include'` on every request. Do not add `credentials` manually, and do not construct `Authorization` headers.
