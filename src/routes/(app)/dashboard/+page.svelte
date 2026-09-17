<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import LocationAutocomplete from '$lib/components/ui/LocationAutocomplete.svelte';
	import type { LocationResult } from '$lib/types/location.js';
	import { goto } from '$app/navigation';
	import { rideSearch } from '$lib/stores/rideSearch.svelte';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let email = $derived(data.email);

	let fromLocation = $state<LocationResult | null>(rideSearch.fromLocation ?? null);
	let toLocation = $state<LocationResult | null>(rideSearch.toLocation ?? null);
	let searchDate = $state(rideSearch.params?.date ?? new Date().toISOString().split('T')[0]);
	let searchSeats = $state(rideSearch.params?.seats ?? 1);
	let searching = $state(false);

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

	async function handleSearch() {
		if (!fromLocation || !toLocation || !searchDate || searching) return;

		searching = true;
		rideSearch.setParams(
			{
				fromId: fromLocation.id,
				fromType: fromLocation.type,
				toId: toLocation.id,
				toType: toLocation.type,
				date: searchDate,
				seats: searchSeats
			},
			{ clearResults: true, fromLocation, toLocation }
		);

		try {
			await goto(resolve('/rides'));
		} finally {
			searching = false;
		}
	}
</script>

<!-- Hero Section & Search Module -->
<section
	class="folk-pattern-bg border-primary/5 relative overflow-hidden border-b pt-20 pb-28 transition-opacity duration-300"
	class:opacity-75={searching}
>
	<div class="relative z-10 mx-auto max-w-7xl px-8">
		<div class="mb-14 max-w-3xl">
			<div class="mb-4 inline-flex items-center gap-2">
				<div class="bg-primary/30 h-px w-8"></div>
				<p class="font-label text-primary text-[0.6875rem] font-bold tracking-[0.3em] uppercase">
					{i18n.t('hero.tagline')}
				</p>
			</div>
			<h1
				class="font-headline text-primary mb-6 text-5xl leading-tight font-extrabold tracking-tight md:text-6xl"
			>
				{i18n.t('hero.title')}
			</h1>
			<p class="text-secondary font-body max-w-xl text-xl">
				{i18n.t('hero.description')}
			</p>

			{#if email}
				<div
					class="bg-primary/5 border-primary/10 mt-8 inline-flex items-center gap-3 rounded-lg border px-4 py-2"
				>
					<span class="material-symbols-outlined text-primary" data-icon="account_circle"
						>account_circle</span
					>
					<div>
						<p class="text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase">
							{i18n.t('hero.signedInAs')}
						</p>
						<p class="font-headline text-primary font-bold">{email}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Search Module with IA accent -->
		<div
			class="glass-panel border-heritage ia-border-accent flex flex-col gap-2 rounded-lg border p-2 shadow-md md:p-4"
		>
			<div class="flex flex-col gap-2 md:flex-row">
				<LocationAutocomplete
					id="search-from"
					label={i18n.t('search.from')}
					placeholder={i18n.t('search.fromPlaceholder')}
					icon="location_on"
					bind:value={fromLocation}
				/>

				<LocationAutocomplete
					id="search-to"
					label={i18n.t('search.to')}
					placeholder={i18n.t('search.toPlaceholder')}
					icon="near_me"
					bind:value={toLocation}
				/>
			</div>

			<div class="flex flex-col gap-2 md:flex-row">
				<div
					class="bg-surface-container-low/50 relative flex flex-1 flex-col rounded-lg px-6 py-4 transition-all focus-within:bg-white hover:bg-white"
				>
					<label
						for="search-date"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
						>{i18n.t('search.date')}</label
					>
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-primary/70" data-icon="calendar_today"
							>calendar_today</span
						>
						<span class="text-primary text-lg font-bold">{getDisplayDate(searchDate)}</span>
						<input
							id="search-date"
							class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
							type="date"
							bind:value={searchDate}
							onclick={showDatePicker}
						/>
					</div>
				</div>

				<div
					class="bg-surface-container-low/50 flex w-full flex-col rounded-lg px-4 py-4 transition-all focus-within:bg-white md:w-32"
				>
					<label
						for="search-seats"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
						>{i18n.t('filters.seats')}</label
					>
					<div class="flex items-center gap-2">
						<span class="material-symbols-outlined text-primary/70" data-icon="person">person</span>
						<input
							id="search-seats"
							class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-lg font-bold focus:ring-0"
							type="number"
							min="1"
							max="4"
							bind:value={searchSeats}
						/>
					</div>
				</div>
				<button
					onclick={handleSearch}
					disabled={!fromLocation || !toLocation || !searchDate || searching}
					class="bg-primary-container font-headline hover:bg-primary group flex w-full items-center justify-center gap-3 rounded-lg px-10 py-6 text-lg font-bold text-white transition-all disabled:opacity-50 md:w-auto"
				>
					{searching ? i18n.t('search.searching') : i18n.t('search.button')}
					{#if searching}
						<span class="material-symbols-outlined animate-spin" data-icon="progress_activity"
							>progress_activity</span
						>
					{:else}
						<span
							class="material-symbols-outlined transition-transform group-hover:translate-x-1"
							data-icon="arrow_forward">arrow_forward</span
						>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Decorative Folk Detail -->
	<div
		class="pointer-events-none absolute -right-24 -bottom-24 hidden scale-150 opacity-5 xl:block"
	>
		<span
			class="material-symbols-outlined text-[30rem]"
			data-icon="hub"
			style="font-variation-settings: 'FILL' 0, 'wght' 100;">hub</span
		>
	</div>
</section>

<!-- IA Pattern Divider -->
<div class="ia-divider w-full opacity-60"></div>

<!-- Values Section with watermark motifs -->
<section class="bg-surface-container-low/40 relative overflow-hidden py-28">
	<div class="folk-watermark absolute inset-0 opacity-40"></div>
	<div class="relative z-10 mx-auto max-w-7xl px-8">
		<div class="grid grid-cols-1 gap-16 md:grid-cols-3">
			<div class="group space-y-6">
				<div
					class="border-outline-variant/10 flex h-16 w-16 items-center justify-center rounded-xl border bg-white shadow-sm transition-all group-hover:shadow-md"
				>
					<span
						class="material-symbols-outlined text-primary-container text-4xl"
						data-icon="diversity_3">diversity_3</span
					>
				</div>
				<h3 class="font-headline text-primary text-2xl font-bold">
					{i18n.t('values.communityTitle')}
				</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.communityDesc')}</p>
			</div>
			<div class="group space-y-6">
				<div
					class="border-outline-variant/10 flex h-16 w-16 items-center justify-center rounded-xl border bg-white shadow-sm transition-all group-hover:shadow-md"
				>
					<span
						class="material-symbols-outlined text-primary-container text-4xl"
						data-icon="verified_user">verified_user</span
					>
				</div>
				<h3 class="font-headline text-primary text-2xl font-bold">
					{i18n.t('values.safetyTitle')}
				</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.safetyDesc')}</p>
			</div>
			<div class="group space-y-6">
				<div
					class="border-outline-variant/10 flex h-16 w-16 items-center justify-center rounded-xl border bg-white shadow-sm transition-all group-hover:shadow-md"
				>
					<span class="material-symbols-outlined text-primary-container text-4xl" data-icon="eco"
						>eco</span
					>
				</div>
				<h3 class="font-headline text-primary text-2xl font-bold">
					{i18n.t('values.natureTitle')}
				</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.natureDesc')}</p>
			</div>
		</div>
	</div>
</section>
