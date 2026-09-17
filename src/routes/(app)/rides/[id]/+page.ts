import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/api/client';
import { getRideDetails } from '$lib/api/rides';

export const load: PageLoad = async ({ params, fetch }) => {
	const rideId = Number(params.id);
	if (!Number.isInteger(rideId) || rideId < 1) throw error(404, 'Ride not found');

	try {
		return { ride: await getRideDetails(rideId, fetch) };
	} catch (err) {
		if (err instanceof ApiError) throw error(err.status, 'Ride not found');
		throw error(500, 'Failed to load ride');
	}
};
