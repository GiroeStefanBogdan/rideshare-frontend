import { request } from './client.js';
import type { LocationResult } from '../types/location.js';

export const getLocations = (query: string): Promise<LocationResult[]> => {
	const encodedQuery = encodeURIComponent(query);
	return request<LocationResult[]>(`/locations/search?q=${encodedQuery}`);
};
