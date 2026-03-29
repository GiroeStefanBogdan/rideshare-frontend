// +page.ts
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

const PUBLIC_API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch(`${PUBLIC_API_URL}/api/v1/dashboard`, {
		credentials: 'include'
	});

	if (res.status === 401) {
		throw redirect(302, '/login');
	}

	try {
		const email = await res.text();
		return { email };
	} catch {
		return { email: null };
	}
};
