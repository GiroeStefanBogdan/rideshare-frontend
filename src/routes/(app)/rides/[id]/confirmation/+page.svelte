<script lang="ts">
	import { fade } from 'svelte/transition';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>{i18n.t('rides.reservedTitle')}</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-20 text-center" in:fade={{ duration: 180 }}>
	<span class="material-symbols-outlined text-primary mb-6 text-7xl">check_circle</span>
	<h1 class="font-headline text-primary mb-4 text-3xl font-bold">
		{i18n.t('rides.reservedTitle')}
	</h1>
	<p class="text-secondary mb-8 text-lg">{i18n.t('rides.reservedMessage')}</p>

	<div
		class="border-outline-variant/20 inline-flex flex-col gap-4 rounded-lg border bg-white px-10 py-6 text-left shadow-md"
	>
		<div>
			<span class="font-label text-secondary/70 text-xs font-bold tracking-widest uppercase">
				{i18n.t('account.rideId')}
			</span>
			<p class="font-headline text-primary text-xl font-bold">#{data.rideId}</p>
		</div>
		{#if data.bookingId}
			<div>
				<span class="font-label text-secondary/70 text-xs font-bold tracking-widest uppercase">
					{i18n.t('account.bookingId')}
				</span>
				<p class="font-headline text-primary text-xl font-bold">#{data.bookingId}</p>
			</div>
		{/if}
	</div>

	<div class="mt-10 flex justify-center gap-3">
		<a
			href={resolve('/rides')}
			class="bg-voronet hover:opacity-90 rounded-lg px-6 py-3 font-bold text-white transition-opacity"
			>{i18n.t('rides.backToResults')}</a
		>
		<a
			href={resolve('/my-rides')}
			class="border-outline-variant/20 text-charcoal hover:bg-surface-container-high rounded-lg border px-6 py-3 font-bold transition-colors"
			>{i18n.t('nav.myRides')}</a
		>
	</div>
</div>
