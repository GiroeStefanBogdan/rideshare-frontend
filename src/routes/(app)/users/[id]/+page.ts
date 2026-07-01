import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import { loadUserById } from '$lib/api/users';
import type { UserProfile } from '$lib/types/user';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const profile: UserProfile = await loadUserById(params.id, fetch);
		return { profile };
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			throw error(404, 'User not found');
		}

		if (err instanceof ApiError) {
			throw error(err.status, 'Failed to load profile');
		}

		throw error(500, 'Failed to load profile');
	}
};
