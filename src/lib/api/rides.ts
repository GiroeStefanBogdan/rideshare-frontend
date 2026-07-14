import { request } from './client.js';
import type {
	RideSearchParams,
	RideSearchResult,
	ReserveRideRequest,
	MyRidesResponse,
	RideDetails
} from '../types/ride.js';

export const getRideDetails = (rideId: number, fetcher?: typeof fetch): Promise<RideDetails> => {
	return request<RideDetails>(`/rides/${rideId}`, undefined, fetcher);
};

export const searchRides = (params: RideSearchParams): Promise<RideSearchResult[]> => {
	return request<RideSearchResult[]>('/rides/search', {
		method: 'POST',
		body: JSON.stringify(params)
	});
};

export const reserveRide = (rideId: number, body: ReserveRideRequest): Promise<number> => {
	return request<number>(`/rides/${rideId}/reserve`, {
		method: 'POST',
		body: JSON.stringify(body)
	});
};

export const getMyRides = (): Promise<MyRidesResponse> => {
	return request<MyRidesResponse>('/rides/me');
};
