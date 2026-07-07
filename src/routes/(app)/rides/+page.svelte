<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { searchRides, reserveRide } from '$lib/api/rides.js';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { rideSearch } from '$lib/stores/rideSearch.svelte';
	import type { RideSearchParams, RideSearchResult } from '$lib/types/ride.js';
	import type { LocationResult } from '$lib/types/location.js';
	import LocationAutocomplete from '$lib/components/ui/LocationAutocomplete.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	let {
		data
	}: {
		data: {
			results: RideSearchResult[];
			searchParams: RideSearchParams | null;
		};
	} = $props();

	const initialParams = untrack(() => rideSearch.params ?? data.searchParams);

	let results = $state<RideSearchResult[]>(
		untrack(() => (rideSearch.results.length ? rideSearch.results : data.results))
	);
	let searchParams = $state<RideSearchParams | null>(initialParams);
	let maxDistanceStart = $state<number | undefined>(initialParams?.maxDistanceStart);
	let timeWindow = $state<RideSearchParams['timeWindow']>(initialParams?.timeWindow || null);
	let smokingAllowed = $state<boolean>(!!initialParams?.smokingAllowed);
	let petFriendly = $state<boolean>(!!initialParams?.petFriendly);
	let loading = $state(untrack(() => !!initialParams && results.length === 0));
	let error = $state<string | null>(null);
	let lastSearchKey = $state('');

	let searchFrom = $state<LocationResult | null>(rideSearch.fromLocation ?? null);
	let searchTo = $state<LocationResult | null>(rideSearch.toLocation ?? null);
	let searchDate = $state(rideSearch.params?.date ?? new Date().toISOString().split('T')[0]);
	let searchSeats = $state(rideSearch.params?.seats ?? 1);

	function getDisplayDate(isoStr: string) {
		if (!isoStr) return '';
		const d = new Date(isoStr);
		return d.toLocaleDateString(i18n.lang === 'ro' ? 'ro-RO' : 'en-US', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		});
	}

	function showDatePicker(event: MouseEvent) {
		const input = event.currentTarget as HTMLInputElement;
		input.showPicker?.();
	}

	function handleRidesSearch() {
		if (!searchFrom || !searchTo || !searchDate || loading) return;

		const params: RideSearchParams = {
			fromId: searchFrom.id,
			fromType: searchFrom.type,
			toId: searchTo.id,
			toType: searchTo.type,
			date: searchDate,
			seats: searchSeats,
			maxDistanceStart: maxDistanceStart && maxDistanceStart > 0 ? maxDistanceStart : undefined,
			timeWindow: timeWindow || undefined,
			smokingAllowed: smokingAllowed || undefined,
			petFriendly: petFriendly || undefined
		};

		rideSearch.setParams(params, { fromLocation: searchFrom, toLocation: searchTo });
	}

	let showSearchModal = $state(false);
	let showFilterModal = $state(false);

	function handleMobileSearch() {
		if (!searchFrom || !searchTo || !searchDate || loading) return;

		const params: RideSearchParams = {
			fromId: searchFrom.id,
			fromType: searchFrom.type,
			toId: searchTo.id,
			toType: searchTo.type,
			date: searchDate,
			seats: searchSeats,
			maxDistanceStart: maxDistanceStart && maxDistanceStart > 0 ? maxDistanceStart : undefined,
			timeWindow: timeWindow || undefined,
			smokingAllowed: smokingAllowed || undefined,
			petFriendly: petFriendly || undefined
		};

		rideSearch.setParams(params, { fromLocation: searchFrom, toLocation: searchTo });
		showSearchModal = false;
	}

	function handleMobileFilters() {
		if (!searchParams || loading) return;

		const nextParams: RideSearchParams = {
			...searchParams,
			fromId: searchFrom?.id ?? searchParams.fromId,
			fromType: searchFrom?.type ?? searchParams.fromType,
			toId: searchTo?.id ?? searchParams.toId,
			toType: searchTo?.type ?? searchParams.toType,
			date: searchDate,
			seats: searchSeats,
			maxDistanceStart: maxDistanceStart && maxDistanceStart > 0 ? maxDistanceStart : undefined,
			timeWindow: timeWindow || undefined,
			smokingAllowed: smokingAllowed || undefined,
			petFriendly: petFriendly || undefined
		};

		rideSearch.setParams(nextParams, { fromLocation: searchFrom, toLocation: searchTo });
		showFilterModal = false;
	}

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

	let cardStates = $state<Record<number, { reserving: boolean; error: string | null }>>({});

	async function handleReserve(ride: RideSearchResult) {
		cardStates[ride.rideId] = { reserving: true, error: null };

		try {
			const requestedSeats = rideSearch.params?.seats ?? 1;
			const response = await reserveRide(ride.rideId, {
				fromStopId: ride.startStop.id,
				toStopId: ride.endStop.id,
				seats: requestedSeats
			});
			await goto(resolve(`/rides/${ride.rideId}?bookingId=${response.id}`));
		} catch (err) {
			const current = cardStates[ride.rideId];
			if (current) {
				current.reserving = false;
				current.error = err instanceof Error ? err.message : i18n.t('rides.reserveError');
			}
		}
	}
</script>

<div class="border-heritage sticky top-0 z-40 hidden border-b bg-white shadow-md md:block">
	<div class="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:gap-3 md:px-8">
		<div class="min-w-0 flex-1">
			<LocationAutocomplete
				id="rides-from"
				placeholder={i18n.t('search.fromPlaceholder')}
				icon="location_on"
				bind:value={searchFrom}
			/>
		</div>
		<div class="min-w-0 flex-1">
			<LocationAutocomplete
				id="rides-to"
				placeholder={i18n.t('search.toPlaceholder')}
				icon="near_me"
				bind:value={searchTo}
			/>
		</div>
		<div class="relative w-28 shrink-0">
			<div
				class="bg-surface-container-low/50 flex cursor-pointer flex-col rounded-lg px-3 py-2 transition-all focus-within:bg-white hover:bg-white"
			>
				<span
					class="material-symbols-outlined text-primary/70 text-lg leading-none"
					data-icon="calendar_today">calendar_today</span
				>
				<span class="text-primary truncate text-xs font-bold">{getDisplayDate(searchDate)}</span>
				<input
					class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
					type="date"
					bind:value={searchDate}
					onclick={showDatePicker}
				/>
			</div>
		</div>
		<div class="w-20 shrink-0">
			<div class="bg-surface-container-low/50 flex items-center gap-1 rounded-lg px-3 py-2">
				<span class="material-symbols-outlined text-primary/70 text-lg" data-icon="person"
					>person</span
				>
				<input
					class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-sm font-bold focus:ring-0"
					type="number"
					min="1"
					max="4"
					bind:value={searchSeats}
				/>
			</div>
		</div>
		<button
			onclick={handleRidesSearch}
			disabled={!searchFrom || !searchTo || !searchDate || loading}
			class="bg-primary hover:bg-primary-container font-headline shrink-0 rounded-lg px-6 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
		>
			{i18n.t('search.button')}
		</button>
	</div>
</div>

<div class="border-heritage sticky top-0 z-40 border-b bg-white shadow-md md:hidden">
	<div
		class="mx-auto flex items-center gap-2 px-4 py-3"
		role="button"
		tabindex="0"
		onclick={() => (showSearchModal = true)}
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Enter') showSearchModal = true;
		}}
	>
		<div class="min-w-0 flex-1">
			{#if searchFrom || searchTo}
				<p class="text-primary truncate text-sm font-bold">
					{searchFrom?.name ?? '…'} <span class="text-secondary/60">&rarr;</span>
					{searchTo?.name ?? '…'}
				</p>
				<p class="text-secondary/70 truncate text-xs">
					{getDisplayDate(searchDate)} &middot;
					{i18n.t('rides.passengers').replace('{count}', String(searchSeats))}
				</p>
			{:else}
				<p class="text-secondary/60 truncate text-sm font-bold">
					{i18n.t('search.from')} &rarr; {i18n.t('search.to')}
				</p>
			{/if}
		</div>
		<button
			type="button"
			onclick={(e: MouseEvent) => {
				e.stopPropagation();
				showFilterModal = true;
			}}
			aria-label={i18n.t('rides.filters')}
			class="bg-surface-container-low/50 hover:bg-surface-container-low rounded-lg p-2 transition-colors"
		>
			<span class="material-symbols-outlined text-primary/70 text-xl" data-icon="tune">tune</span>
		</button>
	</div>
</div>

<div class="mx-auto max-w-7xl px-4 py-10 md:px-8" in:fade={{ duration: 180 }}>
	<div class="flex flex-col gap-8 md:flex-row">
		<aside class="hidden w-full md:block md:w-1/4">
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

					<fieldset class="space-y-2">
						<legend class="font-label text-secondary/80 text-xs font-bold tracking-widest uppercase"
							>{i18n.t('filters.time')}</legend
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
					</fieldset>

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

			<Modal bind:show={showSearchModal}>
				<div class="space-y-5">
					<div class="flex items-center justify-between">
						<h3 class="font-headline text-primary text-lg font-bold">{i18n.t('search.title')}</h3>
						<button
							type="button"
							onclick={() => (showSearchModal = false)}
							class="text-secondary/60 hover:text-secondary rounded-lg p-1 transition-colors"
							aria-label={i18n.t('common.cancel')}
						>
							<span class="material-symbols-outlined text-xl" data-icon="close">close</span>
						</button>
					</div>
					<LocationAutocomplete
						id="modal-from"
						label={i18n.t('search.from')}
						placeholder={i18n.t('search.fromPlaceholder')}
						icon="location_on"
						bind:value={searchFrom}
					/>
					<LocationAutocomplete
						id="modal-to"
						label={i18n.t('search.to')}
						placeholder={i18n.t('search.toPlaceholder')}
						icon="near_me"
						bind:value={searchTo}
					/>
					<div
						class="bg-surface-container-low/50 relative flex flex-1 flex-col rounded-lg px-6 py-4 transition-all focus-within:bg-white hover:bg-white"
					>
						<label
							for="modal-date"
							class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
							>{i18n.t('search.date')}</label
						>
						<div class="flex items-center gap-3">
							<span class="material-symbols-outlined text-primary/70" data-icon="calendar_today"
								>calendar_today</span
							>
							<span class="text-primary text-lg font-bold">{getDisplayDate(searchDate)}</span>
							<input
								id="modal-date"
								class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
								type="date"
								bind:value={searchDate}
								onclick={showDatePicker}
							/>
						</div>
					</div>
					<div
						class="bg-surface-container-low/50 flex w-full flex-col rounded-lg px-4 py-4 transition-all focus-within:bg-white"
					>
						<label
							for="modal-seats"
							class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
							>{i18n.t('filters.seats')}</label
						>
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-primary/70" data-icon="person"
								>person</span
							>
							<input
								id="modal-seats"
								class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-lg font-bold focus:ring-0"
								type="number"
								min="1"
								max="4"
								bind:value={searchSeats}
							/>
						</div>
					</div>
					<button
						onclick={handleMobileSearch}
						disabled={!searchFrom || !searchTo || !searchDate || loading}
						class="bg-primary hover:bg-primary-container font-headline flex w-full items-center justify-center gap-3 rounded-lg px-10 py-4 text-lg font-bold text-white transition-all disabled:opacity-50"
					>
						{i18n.t('search.button')}
						<span class="material-symbols-outlined transition-transform" data-icon="arrow_forward"
							>arrow_forward</span
						>
					</button>
				</div>
			</Modal>

			<Modal bind:show={showFilterModal}>
				<div class="space-y-5">
					<div class="flex items-center justify-between">
						<h3 class="font-headline text-primary text-lg font-bold">
							{i18n.t('rides.filters')}
						</h3>
						<button
							type="button"
							onclick={() => (showFilterModal = false)}
							class="text-secondary/60 hover:text-secondary rounded-lg p-1 transition-colors"
							aria-label={i18n.t('common.cancel')}
						>
							<span class="material-symbols-outlined text-xl" data-icon="close">close</span>
						</button>
					</div>
					<div class="space-y-2">
						<label
							for="modal-filter-distance"
							class="font-label text-secondary/80 text-xs font-bold tracking-widest uppercase"
							>{i18n.t('filters.distanceStart')}</label
						>
						<div class="flex items-center gap-2">
							<input
								id="modal-filter-distance"
								type="number"
								min="0"
								bind:value={maxDistanceStart}
								placeholder="10"
								class="border-outline-variant/30 text-primary w-full rounded-lg border bg-white px-3 py-2 focus:ring-0"
							/>
							<span class="text-secondary/70 text-sm">km</span>
						</div>
					</div>
					<fieldset class="space-y-2">
						<legend class="font-label text-secondary/80 text-xs font-bold tracking-widest uppercase"
							>{i18n.t('filters.time')}</legend
						>
						<div class="flex flex-col gap-2">
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="modal-timeWindow"
									checked={timeWindow === null}
									onchange={() => (timeWindow = null)}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.timeAny')}</span>
							</label>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="modal-timeWindow"
									checked={timeWindow === 'BEFORE_8'}
									onchange={() => (timeWindow = 'BEFORE_8')}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.timeBefore8')}</span>
							</label>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="modal-timeWindow"
									checked={timeWindow === '8_12'}
									onchange={() => (timeWindow = '8_12')}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.time8to12')}</span>
							</label>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="modal-timeWindow"
									checked={timeWindow === '12_18'}
									onchange={() => (timeWindow = '12_18')}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.time12to18')}</span>
							</label>
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="radio"
									name="modal-timeWindow"
									checked={timeWindow === 'AFTER_18'}
									onchange={() => (timeWindow = 'AFTER_18')}
									class="text-primary focus:ring-primary"
								/>
								<span class="text-secondary text-sm">{i18n.t('filters.timeAfter18')}</span>
							</label>
						</div>
					</fieldset>
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
						onclick={handleMobileFilters}
						disabled={loading}
						class="bg-primary hover:bg-primary-container font-headline flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-45"
					>
						<span class="material-symbols-outlined text-lg" data-icon="refresh">refresh</span>
						{i18n.t('filters.apply')}
					</button>
				</div>
			</Modal>

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
						{@const isDeparted = new Date(ride.startStop.departsAt) < new Date()}
						<article
							class="glass-panel border-outline-variant/20 hover:ia-border-accent relative rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
							class:opacity-50={isDeparted}
							in:fly={{ y: 10, duration: 180 }}
						>
							{#if isDeparted}
								<span
									class="absolute top-3 right-3 rounded bg-gray-400 px-2 py-0.5 text-xs font-bold text-white"
								>
									{i18n.t('rides.departed')}
								</span>
							{/if}
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
									{#if !isDeparted}
										{#if cardStates[ride.rideId]?.reserving}
											<button
												disabled
												class="bg-primary/60 mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold text-white"
											>
												<span class="material-symbols-outlined animate-spin text-sm"
													>progress_activity</span
												>
												{i18n.t('rides.reserveLoading')}
											</button>
										{:else if (rideSearch.params?.seats ?? 1) > ride.seatsAvailable}
											<button
												disabled
												class="mt-2 cursor-not-allowed rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-400"
												title={i18n
													.t('rides.notEnoughSeats')
													.replace('{seats}', String(ride.seatsAvailable))}
											>
												{i18n
													.t('rides.notEnoughSeats')
													.replace('{seats}', String(ride.seatsAvailable))}
											</button>
										{:else}
											<button
												onclick={() => handleReserve(ride)}
												class="bg-primary hover:bg-primary-container mt-2 inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
											>
												{i18n.t('rides.reserve')}
											</button>
										{/if}
										{#if cardStates[ride.rideId]?.error}
											<p class="mt-1 text-xs text-red-600">{cardStates[ride.rideId].error}</p>
										{/if}
									{/if}
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
