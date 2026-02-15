import type { UserResponseDto } from '$lib/types/user';

const STORAGE_KEY = 'auth_user';
const EMAIL_KEY = 'auth_email';

function loadFromStorage(): UserResponseDto | null {
	if (typeof sessionStorage === 'undefined') return null;
	const raw = sessionStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as UserResponseDto;
	} catch {
		return null;
	}
}

function loadEmailFromStorage(): string {
	if (typeof sessionStorage === 'undefined') return '';
	return sessionStorage.getItem(EMAIL_KEY) ?? '';
}

function createAuthStore() {
	let user = $state<UserResponseDto | null>(loadFromStorage());
	let email = $state<string>(loadEmailFromStorage());

	return {
		get user() {
			return user;
		},
		get email() {
			return email ?? user?.email ?? '';
		},
		get isAdmin() {
			return user?.role === 'ROLE_ADMIN';
		},
		setUser(u: UserResponseDto) {
			user = u;
			email = u.email;
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
			sessionStorage.setItem(EMAIL_KEY, u.email);
		},
		setEmail(e: string) {
			email = e;
			sessionStorage.setItem(EMAIL_KEY, e);
		},
		clear() {
			user = null;
			email = '';
			sessionStorage.removeItem(STORAGE_KEY);
			sessionStorage.removeItem(EMAIL_KEY);
		}
	};
}

export const authStore = createAuthStore();
