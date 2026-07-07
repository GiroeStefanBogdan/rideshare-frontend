import { requestText } from './client';

export async function getDashboardEmail(fetcher: typeof fetch): Promise<string> {
	return requestText('/dashboard', undefined, fetcher);
}
