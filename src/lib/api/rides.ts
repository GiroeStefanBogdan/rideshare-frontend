import { request } from './client.js';
import type { RideSearchParams, RideSearchResult } from '../types/ride.js';

export const searchRides = (params: RideSearchParams): Promise<RideSearchResult[]> => {
	return request<RideSearchResult[]>('/rides/search', {
		method: 'POST',
		body: JSON.stringify(params)
	});
};
