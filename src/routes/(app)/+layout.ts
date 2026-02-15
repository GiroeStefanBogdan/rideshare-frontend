import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: LayoutLoad = async ({ fetch }) => {
	const res = await fetch(`${PUBLIC_API_URL}/dashboard`, {
		credentials: 'include'
	});

	if (res.status === 401) {
		throw redirect(303, '/login');
	}
};
