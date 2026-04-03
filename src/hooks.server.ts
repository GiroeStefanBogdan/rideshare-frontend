import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

const PUBLIC_API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';

export const handle: Handle = async ({ event, resolve }) => {
	const cookie = event.request.headers.get('cookie');

	if (cookie) {
		try {
			const res = await fetch(`${PUBLIC_API_URL}/users/me`, {
				headers: {
					Cookie: cookie,
					'Content-Type': 'application/json',
				}
			});

			if (res.ok) {
				const user = await res.json();
				event.locals.user = {
					id: String(user.id),
					name: user.name,
					email: user.email,
					avatarUrl: user.avatarUrl ?? null
				};
			} else {
				event.locals.user = null;
			}
		} catch {
			event.locals.user = null;
		}
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
