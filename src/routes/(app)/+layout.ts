import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

const PUBLIC_API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';

export const load: LayoutLoad = async ({ fetch }) => {
	const res = await fetch(`${PUBLIC_API_URL}/dashboard`, {
		credentials: 'include'
	});

	if (res.status === 401) {
		throw redirect(303, '/login');
	}
};
