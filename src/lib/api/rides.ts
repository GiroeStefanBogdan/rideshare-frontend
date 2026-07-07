import { request } from './client.js';
import type {
	RideSearchParams,
	RideSearchResult,
	ReserveRideRequest,
	ReserveRideResponse
} from '../types/ride.js';

export const searchRides = (params: RideSearchParams): Promise<RideSearchResult[]> => {
	return request<RideSearchResult[]>('/rides/search', {
		method: 'POST',
		body: JSON.stringify(params)
	});
};

export const reserveRide = (
	rideId: number,
	body: ReserveRideRequest
): Promise<ReserveRideResponse> => {
	return request<ReserveRideResponse>(`/rides/${rideId}/reserve`, {
		method: 'POST',
		body: JSON.stringify(body)
	});
};
