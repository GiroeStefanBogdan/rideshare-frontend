<script lang="ts">
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { resolve } from '$app/paths';

	let {
		data
	}: {
		data: {
			rideId: number;
			bookingId: string | null;
		};
	} = $props();
</script>

<div class="mx-auto max-w-3xl px-4 py-20 text-center" in:fade={{ duration: 180 }}>
	<span
		class="material-symbols-outlined text-primary-container mb-6 text-7xl"
		data-icon="check_circle">check_circle</span
	>
	<h1 class="font-headline text-primary mb-4 text-3xl font-extrabold">
		{i18n.t('rides.reservedTitle')}
	</h1>
	<p class="text-secondary mb-8 text-lg">{i18n.t('rides.reservedMessage')}</p>

	<div
		class="glass-panel border-outline-variant/20 inline-flex flex-col gap-4 rounded-xl border bg-white px-10 py-6 text-left shadow-sm"
	>
		<div>
			<span class="font-label text-secondary/70 text-xs font-bold tracking-widest uppercase"
				>Ride ID</span
			>
			<p class="font-headline text-primary text-xl font-bold">#{data.rideId}</p>
		</div>
		{#if data.bookingId}
			<div>
				<span class="font-label text-secondary/70 text-xs font-bold tracking-widest uppercase"
					>Booking ID</span
				>
				<p class="font-headline text-primary text-xl font-bold">#{data.bookingId}</p>
			</div>
		{/if}
	</div>

	<div class="mt-10">
		<a
			href={resolve('/rides')}
			class="bg-primary hover:bg-primary/90 font-headline inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold text-white transition-colors"
		>
			<span class="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
			{i18n.t('results.title')}
		</a>
	</div>
</div>
