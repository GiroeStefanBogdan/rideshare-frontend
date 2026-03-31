import { env } from '$env/dynamic/public';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

const PUBLIC_API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${PUBLIC_API_URL}${path}`, {
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		}
	});

	if (res.status === 401) {
		goto(resolve('/login'));
		throw new ApiError(401, 'Unauthorized');
	}

	if (res.status === 204) {
		return undefined as T;
	}

	if (!res.ok) {
		const message = await res.text().catch(() => `HTTP ${res.status}`);
		throw new ApiError(res.status, message);
	}

	return res.json() as Promise<T>;
}
