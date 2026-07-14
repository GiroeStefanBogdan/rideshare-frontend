import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { env } from '$env/dynamic/public';
import { request } from './client';
import { authStore } from '$lib/stores/auth.svelte';
import { i18n } from '$lib/stores/i18n.svelte';
import type { LoginResponse } from '$lib/types/user';

export interface LoginPayload {
	email: string;
	password: string;
	rememberMe: boolean;
}

export interface GoogleLoginPayload {
	idToken: string;
}

// --- Raw API calls ---

/**
 * Email/password login.
 * `rememberMe` is forwarded to the backend so it can set an appropriate
 * cookie Max-Age. The JWT itself always lives in the HTTP-only cookie —
 * we never touch browser storage.
 */
export const login: (payload: LoginPayload) => Promise<LoginResponse> = (payload: LoginPayload) =>
	request('/login', {
		method: 'POST',
		body: JSON.stringify(payload)
	});

/** Exchange a Google ID-token for a session cookie. */
export const googleLogin = (payload: GoogleLoginPayload) =>
	request('/auth/google', {
		method: 'POST',
		body: JSON.stringify(payload)
	});

/** Clear the JWT cookie server-side. */
export const logout = () => request('/auth/logout', { method: 'POST' });

// --- Page handler functions ---

/**
 * Handles email/password form submission.
 * On success, stores the user and navigates to the dashboard.
 * Returns an error string on failure, or null on success.
 */
export async function handleLogin(
	payload: LoginPayload,
	setError: (msg: string) => void
): Promise<void> {
	try {
		const user: LoginResponse = await login(payload);
		authStore.setUser(user.user);
		const requestedRedirect = new URLSearchParams(window.location.search).get('redirect');
		const redirectTo =
			requestedRedirect && requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//')
				? requestedRedirect
				: '/dashboard';
		await goto(resolve(redirectTo as Pathname));
	} catch (err) {
		// 401 → bad credentials; anything else → generic server
		const error = err as { status?: number };
		setError(
			error.status === 401 || error.status === 403
				? i18n.t('auth.invalidCredentials')
				: i18n.t('auth.loginError')
		);
	}
}

/**
 * Redirects the browser to Spring Boot's Google OAuth2 authorization endpoint.
 * This is a full-page redirect — not a fetch — so Spring Boot can drive the
 * OIDC flow and set the HTTP-only cookie on the callback.
 */
export function handleGoogleLogin(): void {
	const base = env.PUBLIC_API_URL ?? 'http://localhost:8080';
	window.location.href = `${base}/oauth2/authorization/google`;
}
