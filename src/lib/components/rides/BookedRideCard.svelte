<script lang="ts">
	import type { BookedRide } from '$lib/types/ride';
	import { i18n } from '$lib/stores/i18n.svelte';
	let { ride }: { ride: BookedRide } = $props();
	const formatTime = (value: string): string =>
		new Intl.DateTimeFormat(i18n.lang === 'ro' ? 'ro-RO' : 'en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short',
			hour12: false
		}).format(new Date(value));
</script>

<article class="border-outline-variant/20 bg-surface rounded-2xl border p-5 shadow-sm">
	<div class="flex items-start justify-between gap-4">
		<div class="flex items-center gap-3">
			{#if ride.driver.avatarUrl}<img
					class="h-12 w-12 rounded-full object-cover"
					src={ride.driver.avatarUrl}
					alt={ride.driver.name}
				/>{:else}<div
					class="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
				>
					{ride.driver.name.charAt(0).toUpperCase()}
				</div>{/if}
			<div>
				<h3 class="font-headline text-lg font-bold">{ride.driver.name}</h3>
				<p class="text-secondary text-sm">
					★ {ride.driver.rating.toFixed(1)} · {ride.driver.reviewsCount}
					{i18n.t('myRides.reviews')}
				</p>
			</div>
		</div>
		{#if ride.status === 'INACTIVE'}<span
				class="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700"
				>{i18n.t('myRides.cancelled')}</span
			>{/if}
	</div>
	<div class="mt-5 grid gap-4 sm:grid-cols-2">
		<div>
			<p class="text-secondary text-xs font-bold uppercase">{i18n.t('myRides.from')}</p>
			<p class="font-semibold">{ride.fromStop.locationName}</p>
			<p class="text-secondary text-sm">{formatTime(ride.fromStop.departsAt)}</p>
		</div>
		<div>
			<p class="text-secondary text-xs font-bold uppercase">{i18n.t('myRides.to')}</p>
			<p class="font-semibold">{ride.toStop.locationName}</p>
			<p class="text-secondary text-sm">{formatTime(ride.toStop.departsAt)}</p>
		</div>
	</div>
	<div class="border-outline-variant/10 mt-5 flex justify-between border-t pt-4 text-sm">
		<span>{ride.seats} {i18n.t('myRides.seats')}</span><strong>{ride.totalPrice} RON</strong>
	</div>
</article>
