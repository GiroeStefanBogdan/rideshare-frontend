import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	throw redirect(302, '/');
};

export const actions = {
	default: ({ cookies }) => {
		cookies.delete('token', { path: '/' });
		throw redirect(303, '/');
	}
} satisfies Actions;
