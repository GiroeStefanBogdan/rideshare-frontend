// +page.ts
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch }) => {
	console.log('Fetching dashboard data...');
	const res = await fetch('http://localhost:8080/dashboard', {
		credentials: 'include' // 🔐 This tells the browser to send cookies
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
