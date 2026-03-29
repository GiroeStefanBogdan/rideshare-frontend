import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { UserProfile } from '$lib/types/user';

const PUBLIC_API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`${PUBLIC_API_URL}/api/v1/users/${params.id}`, {
		credentials: 'include'
	});

	if (res.status === 404) {
		throw error(404, 'User not found');
	}

	if (!res.ok) {
		throw error(res.status, 'Failed to load profile');
	}

	const profile: UserProfile = await res.json();
	return { profile };
};
