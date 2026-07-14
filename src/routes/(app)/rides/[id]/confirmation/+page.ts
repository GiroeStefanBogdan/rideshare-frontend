import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => ({
	rideId: Number(params.id),
	bookingId: url.searchParams.get('bookingId') ?? null
});
