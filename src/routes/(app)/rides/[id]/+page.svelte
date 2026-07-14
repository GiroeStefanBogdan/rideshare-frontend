<script lang="ts">
	import { fade } from 'svelte/transition';
	import { resolve } from '$app/paths';
	import { i18n } from '$lib/stores/i18n.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const ride = $derived(data.ride);

	function formatTime(value: string | null) {
		if (!value) return i18n.t('common.notAvailable');
		return new Intl.DateTimeFormat(i18n.lang === 'ro' ? 'ro-RO' : 'en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short',
			hour12: false
		}).format(new Date(value));
	}
</script>

<svelte:head><title>{i18n.t('rides.detailsTitle')}</title></svelte:head>

<section class="folk-pattern-bg border-primary/5 border-b px-4 py-16">
	<div class="mx-auto max-w-4xl" in:fade={{ duration: 180 }}>
		<a
			href={resolve('/rides')}
			class="font-label text-primary/70 hover:text-primary mb-6 inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
		>
			<span class="material-symbols-outlined text-sm">arrow_back</span>
			{i18n.t('rides.backToResults')}
		</a>
		<p class="font-label text-primary text-xs font-bold tracking-widest uppercase">
			{i18n.t('rides.detailsTitle')}
		</p>
		<h1 class="font-headline text-primary mt-3 text-4xl font-extrabold">{ride.driver.name}</h1>
		<p class="text-secondary mt-2">
			{ride.driver.rating.toFixed(1)} · {ride.driver.reviewsCount}
			{i18n.t('myRides.reviews')}
		</p>
	</div>
</section>

<div class="mx-auto max-w-4xl space-y-6 px-4 py-10">
	<section class="border-outline-variant/20 rounded-lg border bg-white p-6 shadow-md">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h2 class="font-headline text-primary text-2xl font-semibold">{i18n.t('rides.stops')}</h2>
			<p class="text-secondary text-sm">
				{ride.seatsTotal}
				{i18n.t('filters.seats')}
			</p>
		</div>

		<ol class="mt-6 space-y-4">
			{#each ride.rideStops as stop (stop.id)}
				<li
					class="border-outline-variant/20 flex items-start gap-4 rounded-lg border bg-surface p-4"
				>
					<div class="bg-voronet mt-1 h-3 w-3 shrink-0 rounded-full"></div>
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-baseline justify-between gap-3">
							<h3 class="font-headline text-charcoal text-lg font-semibold">
								{stop.locationName}
							</h3>
							<span class="text-secondary text-sm">{formatTime(stop.departsAt)}</span>
						</div>
						<p class="text-secondary text-sm">{stop.municipalityName}</p>
						<p class="text-secondary mt-2 text-sm">
							{stop.pricePerSeat ?? 0} RON · {stop.availableSeats ?? 0}
							{i18n.t('filters.seats')}
						</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>
</div>
