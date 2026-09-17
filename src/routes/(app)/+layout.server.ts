import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/public';
import { getMe } from '$lib/api/users';

export const load: LayoutServerLoad = async ({ locals, request, fetch }) => {
	if (!locals.user) return { user: null };

	// SvelteKit's internal /api fetch does not pass through the Vite proxy on SSR.
	// Keep transport/error handling in the API client, forwarding the session only
	// to the configured backend rather than replacing authenticated server data.
	const backend = (env.PUBLIC_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
	const authenticatedFetch: typeof fetch = (input, init) => {
		const headers = new Headers(init?.headers);
		const cookie = request.headers.get('cookie');
		if (cookie) headers.set('cookie', cookie);
		return fetch(`${backend}${String(input).replace(/^\/api/, '')}`, { ...init, headers });
	};

	return { user: await getMe(authenticatedFetch) };
};
