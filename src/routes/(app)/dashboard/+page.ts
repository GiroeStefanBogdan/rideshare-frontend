// +page.ts
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import { getDashboardEmail } from '$lib/api/dashboard';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const email = await getDashboardEmail(fetch);
		return { email };
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) {
			throw redirect(302, '/login');
		}

		return { email: null };
	}
};
