import type { LayoutLoad } from './$types';
import { getMe } from '$lib/api/users';

export const load: LayoutLoad = async ({ fetch }) => {
	try {
		return { user: await getMe(fetch) };
	} catch {
		return { user: null };
	}
};
