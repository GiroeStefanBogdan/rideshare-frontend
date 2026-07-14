<script lang="ts">
	import type { HostedRide } from '$lib/types/ride';
	import { i18n } from '$lib/stores/i18n.svelte';
	let { ride }: { ride: HostedRide } = $props();
	let expanded = $state(false);
	const formatTime = (value: string): string =>
		new Intl.DateTimeFormat(i18n.lang === 'ro' ? 'ro-RO' : 'en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short',
			hour12: false
		}).format(new Date(value));
</script>

<article class="border-outline-variant/20 bg-surface rounded-2xl border p-5 shadow-sm">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h3 class="font-headline text-lg font-bold">
				{ride.rideStops[0]?.locationName} → {ride.rideStops.at(-1)?.locationName}
			</h3>
			<p class="text-secondary mt-1 text-sm">
				{ride.seatsTotal}
				{i18n.t('myRides.seats')} · {formatTime(ride.rideStops[0]?.departsAt)}
			</p>
		</div>
		{#if ride.status === 'INACTIVE'}<span
				class="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
				>{i18n.t('myRides.cancelled')}</span
			>{/if}
	</div>
	{#if ride.rideStops.length > 2}<button
			class="text-primary mt-4 text-sm font-bold"
			type="button"
			onclick={() => (expanded = !expanded)}
			>{expanded ? i18n.t('myRides.hideStops') : i18n.t('myRides.showStops')}</button
		>{/if}
	{#if expanded}<div class="border-outline-variant/10 mt-4 space-y-3 border-t pt-4">
			{#each ride.rideStops as stop}<div class="flex justify-between gap-3 text-sm">
					<span>{stop.stopOrder}. {stop.locationName}</span><span class="text-secondary"
						>{formatTime(stop.departsAt)} · {stop.pricePerSeat ?? 0} RON</span
					>
				</div>{/each}
		</div>{/if}
</article>
