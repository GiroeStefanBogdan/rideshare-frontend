import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import { authStore } from '$lib/stores/auth.svelte';
import { getMe } from '$lib/api/users';

export const load: LayoutLoad = async ({ fetch }) => {
	// Re-verify the session on the client after a page refresh.
	// Since authStore hydrates from sessionStorage, we only call getMe()
	// to ensure the session is still valid with the backend.
	if (browser && authStore.user) {
		try {
			const user = await getMe(fetch);
			authStore.setUser(user);
		} catch {
			authStore.clear();
		}
	}
};
