<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { searchRides } from '$lib/api/rides.js';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { rideSearch } from '$lib/stores/rideSearch.svelte';
	import type { RideSearchParams, RideSearchResult } from '$lib/types/ride.js';

	let {
		data
	}: {
		data: {
			results: RideSearchResult[];
			searchParams: RideSearchParams | null;
		};
	} = $props();

	const initialParams = rideSearch.params ?? data.searchParams;

	let results = $state<RideSearchResult[]>(
		rideSearch.results.length ? rideSearch.results : data.results
	);
	let searchParams = $state<RideSearchParams | null>(initialParams);
	let maxDistanceStart = $state<number | undefined>(initialParams?.maxDistanceStart);
	let timeWindow = $state<RideSearchParams['timeWindow']>(initialParams?.timeWindow || null);
	let smokingAllowed = $state<boolean>(!!initialParams?.smokingAllowed);
	let petFriendly = $state<boolean>(!!initialParams?.petFriendly);
	let loading = $state(!!initialParams && results.length === 0);
	let error = $state<string | null>(null);
	let lastSearchKey = $state('');

	let filtersChanged = $derived(
		!!searchParams &&
			(maxDistanceStart !== searchParams.maxDistanceStart ||
				timeWindow !== (searchParams.timeWindow || null) ||
				smokingAllowed !== !!searchParams.smokingAllowed ||
				petFriendly !== !!searchParams.petFriendly)
	);

	$effect(() => {
		const params = rideSearch.params;
		if (!params) return;

		const searchKey = JSON.stringify(params);
		if (searchKey === lastSearchKey) return;

		lastSearchKey = searchKey;
		searchParams = params;
		setFilterState(params);
		runSearch(params);
	});

	function setFilterState(params: RideSearchParams) {
		maxDistanceStart = params.maxDistanceStart;
		timeWindow = params.timeWindow || null;
		smokingAllowed = !!params.smokingAllowed;
		petFriendly = !!params.petFriendly;
	}

	function applyFilters() {
		if (!searchParams || loading) return;

		const nextParams: RideSearchParams = {
			...searchParams,
			maxDistanceStart: maxDistanceStart && maxDistanceStart > 0 ? maxDistanceStart : undefined,
			timeWindow: timeWindow || undefined,
			smokingAllowed: smokingAllowed || undefined,
			petFriendly: petFriendly || undefined
		};

		rideSearch.setParams(nextParams);
	}

	async function runSearch(params: RideSearchParams) {
		loading = true;
		error = null;

		try {
			const nextResults = await searchRides(params);
			results = nextResults;
			rideSearch.setResults(nextResults);
		} catch (err) {
			error = err instanceof Error ? err.message : i18n.t('results.loadError');
		} finally {
			loading = false;
		}
	}

	function formatTime(value: string) {
		return new Date(value).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatDistance(value: number) {
		return value.toFixed(1);
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-10 md:px-8" in:fade={{ duration: 180 }}>
	<div class="flex flex-col gap-8 md:flex-row">
		<aside class="w-full md:w-1/4">
			<div class="glass-panel border-outline-variant/20 sticky top-24 rounded-xl border p-6">
				<div class="mb-6 flex items-center justify-between gap-4">
					<h2 class="font-headline text-primary text-xl font-bold">{i18n.t('filters.title')}</h2>
					<span class="material-symbols-outlined text-primary/60" data-icon="tune">tune</span>
				</div>

				<div class="space-y-6">
					<div class="space-y-2">
						<label
							for="filter-distance"
							class="font-label text-secondary/80 text-xs font-bold tracking-widest uppercase"
							>{i18n.t('filters.distanceStart')}</label
						>
						<div class="flex items-center gap-2">
							<input
								id="filter-distance"
								type="number"
								min="0"
								bind:value={maxDistanceStart}
								placeholder="10"
								class="border-outline-variant/30 text-primary w-full rounded-lg border bg-white px-3 py-2 focus:ring-0"
							/>
							<span class="text-secondary/70 text-sm">km</span>
						</div>
					</div>

					<div class="space-y-2">
						<label class="font-label text-secondary/80 text-xs font-bold tracking-widest uppercase"
							>{i18n.t('filters.time')}</label
						>
						<div class="flex flex-col gap-2">
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="timeWindow"
									checked={timeWindow === null}
									onchange={() => (timeWindow = null)}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.timeAny')}</span>
							</label>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="timeWindow"
									checked={timeWindow === 'BEFORE_8'}
									onchange={() => (timeWindow = 'BEFORE_8')}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.timeBefore8')}</span>
							</label>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="timeWindow"
									checked={timeWindow === '8_12'}
									onchange={() => (timeWindow = '8_12')}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.time8to12')}</span>
							</label>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="timeWindow"
									checked={timeWindow === '12_18'}
									onchange={() => (timeWindow = '12_18')}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.time12to18')}</span>
							</label>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="timeWindow"
									checked={timeWindow === 'AFTER_18'}
									onchange={() => (timeWindow = 'AFTER_18')}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.timeAfter18')}</span>
							</label>
						</div>
					</div>

					<div class="space-y-4 pt-2">
						<label class="flex cursor-pointer items-center justify-between">
							<span class="text-secondary text-sm">{i18n.t('filters.smokingAllowed')}</span>
							<input
								type="checkbox"
								bind:checked={smokingAllowed}
								class="text-primary focus:ring-primary h-5 w-5 rounded border-gray-300"
							/>
						</label>
						<label class="flex cursor-pointer items-center justify-between">
							<span class="text-secondary text-sm">{i18n.t('filters.petFriendly')}</span>
							<input
								type="checkbox"
								bind:checked={petFriendly}
								class="text-primary focus:ring-primary h-5 w-5 rounded border-gray-300"
							/>
						</label>
					</div>

					<button
						onclick={applyFilters}
						disabled={!filtersChanged || loading}
						class="bg-primary hover:bg-primary-container font-headline flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-45"
					>
						<span class="material-symbols-outlined text-lg" data-icon="refresh">refresh</span>
						{i18n.t('filters.apply')}
					</button>
				</div>
			</div>
		</aside>

		<div class="relative w-full md:w-3/4">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="font-headline text-primary text-3xl font-extrabold">
					{i18n.t('results.title')}
				</h1>
				<div
					class="bg-primary-container/10 text-primary-container rounded-full px-4 py-1 text-sm font-bold"
				>
					{loading
						? i18n.t('search.searching')
						: `${results.length} ${i18n.t('results.ridesCount')}`}
				</div>
			</div>

			{#if loading}
				<div
					class="absolute inset-0 z-20 flex items-start justify-center bg-white/70 pt-24 backdrop-blur-[2px]"
				>
					<div
						class="glass-panel ia-border-accent border-outline-variant/20 flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border bg-white p-8 text-center shadow-xl"
						in:fly={{ y: 8, duration: 160 }}
					>
						<div class="relative flex h-16 w-16 items-center justify-center">
							<div class="border-primary/15 absolute inset-0 rounded-full border-4"></div>
							<div
								class="border-primary h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
							></div>
							<span
								class="material-symbols-outlined text-primary absolute"
								data-icon="directions_car">directions_car</span
							>
						</div>
						<div>
							<p class="font-headline text-primary text-lg font-bold">
								{i18n.t('results.loadingTitle')}
							</p>
							<p class="text-secondary mt-1 text-sm">{i18n.t('results.loadingDescription')}</p>
						</div>
					</div>
				</div>
			{/if}

			{#if error}
				<div
					class="border-outline-variant/20 mb-6 rounded-xl border bg-white p-4 text-sm text-red-600"
				>
					{error}
				</div>
			{/if}

			<div class="space-y-6 transition-opacity duration-200" class:opacity-30={loading}>
				{#if loading && results.length === 0}
					<div class="min-h-80 rounded-xl border border-transparent"></div>
				{:else if !searchParams}
					<div class="glass-panel border-outline-variant/20 rounded-xl border p-12 text-center">
						<span
							class="material-symbols-outlined text-outline-variant mb-4 text-6xl"
							data-icon="route">route</span
						>
						<p class="text-secondary text-lg">{i18n.t('results.noSearch')}</p>
					</div>
				{:else if results.length === 0}
					<div class="glass-panel border-outline-variant/20 rounded-xl border p-12 text-center">
						<span
							class="material-symbols-outlined text-outline-variant mb-4 text-6xl"
							data-icon="directions_car">directions_car</span
						>
						<p class="text-secondary text-lg">{i18n.t('results.noRides')}</p>
					</div>
				{:else}
					{#each results as ride (ride.rideId)}
						<article
							class="glass-panel border-outline-variant/20 hover:ia-border-accent rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
							in:fly={{ y: 10, duration: 180 }}
						>
							<div class="flex items-start justify-between gap-4 md:items-center">
								<div class="flex items-center gap-4">
									<div
										class="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-sm"
									>
										{#if ride.driver.avatarUrl}
											<img
												src={ride.driver.avatarUrl}
												alt={ride.driver.name}
												class="h-full w-full object-cover"
											/>
										{:else}
											<div
												class="bg-surface-container-low flex h-full w-full items-center justify-center"
											>
												<span class="material-symbols-outlined text-secondary/50" data-icon="person"
													>person</span
												>
											</div>
										{/if}
									</div>
									<div>
										<p class="font-headline text-primary text-lg font-bold">{ride.driver.name}</p>
										<div class="flex items-center gap-1 text-sm text-amber-500">
											<span class="material-symbols-outlined text-[1rem]" data-icon="star"
												>star</span
											>
											<span class="font-bold">{(ride.driver.rating ?? 0).toFixed(1)}</span>
											<span class="text-secondary/60">({ride.driver.reviewsCount})</span>
										</div>
									</div>
								</div>

								<div class="mt-4 text-right md:mt-0">
									<p class="font-headline text-primary text-3xl font-extrabold">
										{ride.totalPrice} <span class="text-lg">RON</span>
									</p>
									<p
										class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
									>
										{i18n.t('results.perSeat')}
									</p>
								</div>
							</div>

							<div class="ia-divider my-6 opacity-40"></div>

							<div class="flex flex-col gap-3 md:px-4">
								<div class="flex items-center justify-between gap-4">
									<div class="w-20">
										<span class="font-headline text-primary block text-lg font-bold">
											{formatTime(ride.startStop.departsAt)}
										</span>
									</div>

									<div class="relative flex-1">
										<div
											class="bg-outline-variant/30 absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2"
										></div>
										<div
											class="absolute top-1/2 left-0 h-2 w-2 -translate-y-1/2 rounded-full bg-indigo-500"
										></div>
										<div
											class="bg-primary absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 rounded-full"
										></div>
									</div>

									<span class="text-secondary w-36 truncate text-right text-sm font-semibold">
										{ride.endStop.locationName}
									</span>
								</div>
								<div class="flex justify-between gap-4 text-sm">
									<span class="text-secondary w-36 truncate font-medium"
										>{ride.startStop.locationName}</span
									>
									<span
										class="font-label text-secondary/60 text-right text-[0.6875rem] font-bold tracking-widest uppercase"
									>
										{i18n.t('results.destination')}
									</span>
								</div>
							</div>

							<div
								class="mt-6 flex flex-wrap items-center gap-4 rounded-lg bg-gray-50/50 px-4 py-3"
							>
								<div class="flex items-center gap-2 text-sm text-gray-600">
									<span
										class="material-symbols-outlined text-[1.125rem]"
										data-icon="directions_walk">directions_walk</span
									>
									<span>
										<strong class="text-gray-900"
											>{formatDistance(ride.distanceToStartKm)} km</strong
										>
										{i18n.t('results.distanceStart')}
									</span>
								</div>
								<div class="h-4 w-px bg-gray-200"></div>
								<div class="flex items-center gap-2 text-sm text-gray-600">
									<span class="material-symbols-outlined text-[1.125rem]" data-icon="event_seat"
										>event_seat</span
									>
									<span
										><strong class="text-gray-900">{ride.seatsAvailable}</strong>
										{i18n.t('filters.seats')}</span
									>
								</div>
								{#if ride.driver.smokingAllowed}
									<div class="h-4 w-px bg-gray-200"></div>
									<div
										class="flex items-center gap-2 text-sm text-gray-600"
										title={i18n.t('filters.smokingAllowed')}
									>
										<span
											class="material-symbols-outlined text-[1.125rem]"
											data-icon="smoking_rooms">smoking_rooms</span
										>
									</div>
								{/if}
								{#if ride.driver.petFriendly}
									<div class="h-4 w-px bg-gray-200"></div>
									<div
										class="flex items-center gap-2 text-sm text-gray-600"
										title={i18n.t('filters.petFriendly')}
									>
										<span class="material-symbols-outlined text-[1.125rem]" data-icon="pets"
											>pets</span
										>
									</div>
								{/if}
							</div>
						</article>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
