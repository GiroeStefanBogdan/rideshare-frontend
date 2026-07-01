import { env } from '$env/dynamic/public';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

const PUBLIC_API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';
const API_BASE = typeof window === 'undefined' ? PUBLIC_API_URL : '/api';
const SVELTEKIT_FETCH_API_BASE = '/api';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function send(path: string, options?: RequestInit, fetcher: typeof fetch = fetch): Promise<Response> {
	const base = fetcher === fetch ? API_BASE : SVELTEKIT_FETCH_API_BASE;

	const res = await fetcher(`${base}${path}`, {
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'X-API-Version': '1',
			...options?.headers
		}
	});

	if (res.status === 401) {
		if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
			goto(resolve('/login'));
		}
		throw new ApiError(401, 'Unauthorized');
	}

	if (!res.ok) {
		const message = await res.text().catch(() => `HTTP ${res.status}`);
		throw new ApiError(res.status, message);
	}

	return res;
}

export async function request<T>(
	path: string,
	options?: RequestInit,
	fetcher?: typeof fetch
): Promise<T> {
	const res = await send(path, options, fetcher);

	if (res.status === 204) {
		return undefined as T;
	}

	return res.json() as Promise<T>;
}

export async function requestText(
	path: string,
	options?: RequestInit,
	fetcher?: typeof fetch
): Promise<string> {
	const res = await send(path, options, fetcher);
	if (res.status === 204) {
		return '';
	}

	return res.text();
}
