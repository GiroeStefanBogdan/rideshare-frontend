import type { RideSearchParams, RideSearchResult } from '$lib/types/ride.js';
import type { LocationResult } from '$lib/types/location.js';

function createRideSearchStore() {
	let params = $state<RideSearchParams | null>(null);
	let results = $state<RideSearchResult[]>([]);
	let fromLocation = $state<LocationResult | null>(null);
	let toLocation = $state<LocationResult | null>(null);

	return {
		get params() {
			return params;
		},
		get results() {
			return results;
		},
		get fromLocation() {
			return fromLocation;
		},
		get toLocation() {
			return toLocation;
		},
		setParams(
			nextParams: RideSearchParams,
			options?: {
				clearResults?: boolean;
				fromLocation?: LocationResult | null;
				toLocation?: LocationResult | null;
			}
		) {
			params = { ...nextParams };
			if (options?.clearResults) {
				results = [];
			}
			if (options?.fromLocation !== undefined) {
				fromLocation = options.fromLocation;
			}
			if (options?.toLocation !== undefined) {
				toLocation = options.toLocation;
			}
		},
		setResults(nextResults: RideSearchResult[]) {
			results = nextResults;
		},
		clear() {
			params = null;
			results = [];
			fromLocation = null;
			toLocation = null;
		}
	};
}

export const rideSearch = createRideSearchStore();
