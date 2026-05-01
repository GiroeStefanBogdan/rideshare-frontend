import type { RideSearchParams, RideSearchResult } from '$lib/types/ride.js';

function createRideSearchStore() {
	let params = $state<RideSearchParams | null>(null);
	let results = $state<RideSearchResult[]>([]);

	return {
		get params() {
			return params;
		},
		get results() {
			return results;
		},
		setParams(nextParams: RideSearchParams, options?: { clearResults?: boolean }) {
			params = { ...nextParams };
			if (options?.clearResults) {
				results = [];
			}
		},
		setResults(nextResults: RideSearchResult[]) {
			results = nextResults;
		},
		clear() {
			params = null;
			results = [];
		}
	};
}

export const rideSearch = createRideSearchStore();
