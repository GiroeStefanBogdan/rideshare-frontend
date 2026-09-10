import { request } from './client.js';
import type {
	RideSearchParams,
	RideSearchResult,
	PublishRideRequest,
	PublishRideResponse,
	RideDetails,
	ReserveRideRequest,
	ReserveRideResponse
} from '../types/ride.js';

export const loadRideDetails = (rideId: number, fetcher: typeof fetch): Promise<RideDetails> => {
	return request<RideDetails>(`/rides/${rideId}`, undefined, fetcher);
};

export const publishRide = (body: PublishRideRequest): Promise<PublishRideResponse> => {
	return request<PublishRideResponse>('/rides', {
		method: 'POST',
		body: JSON.stringify(body)
	});
};

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
