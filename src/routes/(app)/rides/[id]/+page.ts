import type { PageLoad } from './$types';
import { loadRideDetails } from '$lib/api/rides';

export const load: PageLoad = async ({ params, url, fetch }) => {
	const rideId = Number(params.id);
	return {
		ride: await loadRideDetails(rideId, fetch),
		bookingId: url.searchParams.get('bookingId') ?? null
	};
};
