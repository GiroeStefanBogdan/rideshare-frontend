import { PUBLIC_API_URL } from '$env/static/public';
import { goto } from '$app/navigation';

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
		goto('/login');
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
