<script lang="ts">
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { resolve } from '$app/paths';
	import type { RideDetails } from '$lib/types/ride';

	let { data }: { data: { ride: RideDetails; bookingId: string | null } } = $props();

	function formatDate(value: string) {
		return new Date(value).toLocaleString(i18n.lang === 'ro' ? 'ro-RO' : 'en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

<main class="bg-surface text-on-surface min-h-screen px-4 py-16" in:fade={{ duration: 180 }}>
	<div class="mx-auto max-w-3xl">
		{#if data.bookingId}
			<div
				class="border-outline-variant/30 mb-6 rounded-lg border bg-white p-6 text-center shadow-md"
			>
				<span class="material-symbols-outlined text-primary-container text-5xl">check_circle</span>
				<h2 class="mt-2 text-2xl font-semibold">{i18n.t('rides.reservedTitle')}</h2>
				<p class="text-base leading-relaxed font-normal">
					{i18n.t('rides.reservedMessage')} #{data.bookingId}
				</p>
			</div>
		{/if}

		<header class="mb-8">
			<p class="text-primary-container text-xs font-semibold tracking-widest uppercase">
				{i18n.t('rides.rideDetails')} #{data.ride.rideId}
			</p>
			<h1 class="mt-2 text-4xl font-bold tracking-tight">
				{data.ride.rideStops[0]?.locationName} → {data.ride.rideStops.at(-1)?.locationName}
			</h1>
		</header>

		<section class="border-outline-variant/30 rounded-lg border bg-white p-6 shadow-md">
			<h2 class="mb-5 text-2xl font-semibold">{i18n.t('rides.itinerary')}</h2>
			<ol class="space-y-4">
				{#each data.ride.rideStops as stop, index (stop.id)}
					<li class="border-outline-variant/30 bg-surface-container-low/60 rounded-lg border p-4">
						<p class="text-xs font-semibold tracking-widest uppercase">
							{index === 0
								? i18n.t('publish.origin')
								: index === data.ride.rideStops.length - 1
									? i18n.t('publish.destination')
									: `${i18n.t('publish.stop')} ${index}`}
						</p>
						<h3 class="text-xl font-semibold">{stop.locationName}</h3>
						<p class="text-base leading-relaxed font-normal">
							{formatDate(stop.departsAt)} · {stop.cumulativePricePerSeat} RON
						</p>
					</li>
				{/each}
			</ol>
		</section>

		<section
			class="border-outline-variant/30 mt-6 grid gap-4 rounded-lg border bg-white p-6 shadow-md md:grid-cols-3"
		>
			<div>
				<p class="text-xs font-semibold tracking-widest uppercase">{i18n.t('rides.driver')}</p>
				<p class="text-xl font-semibold">{data.ride.driver.name}</p>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-widest uppercase">{i18n.t('publish.capacity')}</p>
				<p class="text-xl font-semibold">{data.ride.seatsTotal}</p>
			</div>
			<div>
				<p class="text-xs font-semibold tracking-widest uppercase">{i18n.t('publish.vehicle')}</p>
				<p class="text-xl font-semibold">
					{data.ride.vehicle
						? `${data.ride.vehicle.color} ${data.ride.vehicle.brand} ${data.ride.vehicle.model} (${data.ride.vehicle.year})`
						: i18n.t('publish.noVehicle')}
				</p>
			</div>
		</section>

		<a
			href={resolve('/rides')}
			class="bg-primary-container mt-8 inline-flex rounded-lg px-6 py-3 font-semibold text-white transition-opacity duration-150 hover:opacity-90"
			>{i18n.t('results.title')}</a
		>
	</div>
</main>
