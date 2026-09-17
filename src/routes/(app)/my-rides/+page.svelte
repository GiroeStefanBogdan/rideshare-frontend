<script lang="ts">
	import { getMyRides } from '$lib/api/rides';
	import BookedRideCard from '$lib/components/rides/BookedRideCard.svelte';
	import HostedRideCard from '$lib/components/rides/HostedRideCard.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import type { MyRidesResponse } from '$lib/types/ride';
	let data = $state<MyRidesResponse | null>(null);
	let loading = $state(true);
	let error = $state(false);
	let tab = $state<'booked' | 'hosted'>('booked');
	async function loadRides(): Promise<void> {
		loading = true;
		error = false;
		try {
			data = await getMyRides();
		} catch {
			error = true;
		} finally {
			loading = false;
		}
	}
	$effect(() => {
		void loadRides();
	});
</script>

<svelte:head><title>{i18n.t('myRides.title')}</title></svelte:head>
<section class="mx-auto w-full max-w-7xl px-8 py-12">
	<h1 class="font-headline text-primary text-4xl font-black">{i18n.t('myRides.title')}</h1>
	<div class="mt-8 flex gap-2 border-b border-outline-variant/20">
		<button
			class="border-b-2 px-4 py-3 font-bold {tab === 'booked'
				? 'border-primary text-primary'
				: 'border-transparent text-secondary'}"
			onclick={() => (tab = 'booked')}
			>{i18n.t('myRides.booked')}
			{data ? `(${data.upcomingBookings.length + data.pastBookings.length})` : ''}</button
		><button
			class="border-b-2 px-4 py-3 font-bold {tab === 'hosted'
				? 'border-primary text-primary'
				: 'border-transparent text-secondary'}"
			onclick={() => (tab = 'hosted')}
			>{i18n.t('myRides.hosted')}
			{data ? `(${data.upcomingHostedRides.length + data.pastHostedRides.length})` : ''}</button
		>
	</div>
	{#if loading}<div class="mt-8 grid gap-5 md:grid-cols-2">
			{#each [1, 2, 3, 4] as placeholder (placeholder)}<div
					class="h-48 animate-pulse rounded-2xl bg-primary/5"
				></div>{/each}
		</div>
	{:else if error}<div class="mt-10 rounded-2xl bg-red-50 p-8 text-center">
			<p class="text-red-700">{i18n.t('myRides.error')}</p>
			<button
				class="bg-primary mt-4 rounded-lg px-4 py-2 font-bold text-white"
				onclick={() => void loadRides()}>{i18n.t('myRides.retry')}</button
			>
		</div>
	{:else if data}{#if tab === 'booked'}<section class="mt-10">
				<h2 class="font-headline text-2xl font-bold">{i18n.t('myRides.upcoming')}</h2>
				<div class="mt-4 grid gap-5 md:grid-cols-2">
					{#each data.upcomingBookings as ride (ride.bookingId)}<BookedRideCard {ride} />{:else}<p
							class="text-secondary"
						>
							{i18n.t('myRides.nothingUpcoming')}
						</p>{/each}
				</div>
			</section>
			<section class="mt-10">
				<h2 class="font-headline text-2xl font-bold">{i18n.t('myRides.past')}</h2>
				<div class="mt-4 grid gap-5 md:grid-cols-2">
					{#each data.pastBookings as ride (ride.bookingId)}<BookedRideCard {ride} />{:else}<p
							class="text-secondary"
						>
							{i18n.t('myRides.nothingPast')}
						</p>{/each}
				</div>
			</section>{:else}<section class="mt-10">
				<h2 class="font-headline text-2xl font-bold">{i18n.t('myRides.upcoming')}</h2>
				<div class="mt-4 space-y-5">
					{#each data.upcomingHostedRides as ride (ride.rideId)}<HostedRideCard {ride} />{:else}<p
							class="text-secondary"
						>
							{i18n.t('myRides.nothingUpcoming')}
						</p>{/each}
				</div>
			</section>
			<section class="mt-10">
				<h2 class="font-headline text-2xl font-bold">{i18n.t('myRides.past')}</h2>
				<div class="mt-4 space-y-5">
					{#each data.pastHostedRides as ride (ride.rideId)}<HostedRideCard {ride} />{:else}<p
							class="text-secondary"
						>
							{i18n.t('myRides.nothingPast')}
						</p>{/each}
				</div>
			</section>{/if}{/if}
</section>
