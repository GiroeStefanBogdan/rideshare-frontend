<script lang="ts">
	import type { HostedRideView } from '$lib/rides/classification.svelte';
	import { isOngoing, scheduledEnd } from '$lib/rides/classification.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	let { ride, phase }: { ride: HostedRideView; phase: 'upcoming' | 'past' | 'cancelled' } =
		$props();
	let expanded = $state(false);
	const formatTime = (value: string | null | undefined): string =>
		value
			? new Intl.DateTimeFormat(i18n.lang === 'ro' ? 'ro-RO' : 'en-GB', {
					dateStyle: 'medium',
					timeStyle: 'short',
					hour12: false
				}).format(new Date(value))
			: i18n.t('common.notAvailable');
	const end = $derived(scheduledEnd(ride));
	const ongoing = $derived(phase === 'upcoming' && isOngoing(ride));
</script>

<article
	class="border-outline-variant/20 bg-surface rounded-2xl border p-5 shadow-sm {phase ===
	'cancelled'
		? 'bg-surface-container-low grayscale'
		: ''}"
>
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
		{#if phase === 'cancelled'}<span
				class="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
				>{i18n.t('myRides.cancelled')}</span
			>{:else if ongoing}<span
				class="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
				>{i18n.t('myRides.onTheWay')}</span
			>{/if}
	</div>
	{#if end}<p class="text-secondary text-sm">
			{i18n.t('myRides.arrivalLabel')}
			{formatTime(ride.rideStops.at(-1)?.departsAt)}
		</p>{:else}<p class="text-secondary text-sm">{i18n.t('myRides.scheduleUnavailable')}</p>{/if}
	{#if ride.rideStops.length > 2}<button
			class="text-primary mt-4 text-sm font-bold"
			type="button"
			aria-expanded={expanded}
			onclick={() => (expanded = !expanded)}
			>{expanded ? i18n.t('myRides.hideStops') : i18n.t('myRides.showStops')}</button
		>{/if}
	{#if expanded}<div class="border-outline-variant/10 mt-4 space-y-3 border-t pt-4">
			{#each ride.rideStops as stop (stop.id)}<div class="flex justify-between gap-3 text-sm">
					<span>{stop.stopOrder}. {stop.locationName}</span><span class="text-secondary"
						>{formatTime(stop.departsAt)} · {stop.cumulativePricePerSeat ?? 0} RON</span
					>
				</div>{/each}
		</div>{/if}
</article>
