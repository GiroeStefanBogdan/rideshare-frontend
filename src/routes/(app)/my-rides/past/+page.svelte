<script lang="ts">
	import { getMyRides } from '$lib/api/rides';
	import BookedRideCard from '$lib/components/rides/BookedRideCard.svelte';
	import HostedRideCard from '$lib/components/rides/HostedRideCard.svelte';
	import ReviewsToWrite from '$lib/components/reviews/ReviewsToWrite.svelte';
	import { getMyReviewEligibility } from '$lib/api/reviews';
	import type { ReviewEligibility } from '$lib/types/review';
	import { type BookedRideView, type HostedRideView } from '$lib/rides/classification.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { MyRidesResponse } from '$lib/types/ride';
	let data = $state<MyRidesResponse | null>(null);
	let loading = $state(true);
	let error = $state(false);
	let tab = $state<'booked' | 'hosted'>(
		page.url.searchParams.get('role') === 'hosted' ? 'hosted' : 'booked'
	);
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

	let eligibility = $state<ReviewEligibility[]>([]);

	async function loadEligibility(): Promise<void> {
		try {
			eligibility = await getMyReviewEligibility();
		} catch {
			eligibility = [];
		}
	}

	$effect(() => {
		void loadEligibility();
	});
	function bookedView(booking: MyRidesResponse['upcomingBookings'][number]): BookedRideView {
		return {
			...booking,
			status: booking.status,
			startTime: booking.fromStop.departsAt ?? null,
			endTime: booking.toStop.departsAt ?? null
		};
	}
	function hostedView(ride: MyRidesResponse['upcomingHostedRides'][number]): HostedRideView {
		return {
			...ride,
			status: ride.status,
			startTime: ride.rideStops[0]?.departsAt ?? null,
			endTime: ride.rideStops.at(-1)?.departsAt ?? null
		};
	}
	const booked = $derived(
		data ? { past: data.pastBookings.filter((r) => r.status === 'ACTIVE').map(bookedView) } : null
	);
	const hosted = $derived(
		data
			? { past: data.pastHostedRides.filter((r) => r.status === 'ACTIVE').map(hostedView) }
			: null
	);
</script>

<svelte:head><title>{i18n.t('myRides.past')}</title></svelte:head>
<section class="mx-auto w-full max-w-7xl px-8 py-12">
	<a class="text-primary text-sm font-bold underline" href={resolve(`/my-rides?role=${tab}`)}
		>{i18n.t('myRides.backToUpcoming')}</a
	>
	<h1 class="font-headline text-primary mt-4 text-4xl font-black">{i18n.t('myRides.past')}</h1>
	<div class="border-outline-variant/20 mt-8 flex gap-2 border-b">
		<button
			class="border-b-2 px-4 py-3 font-bold {tab === 'booked'
				? 'border-primary text-primary'
				: 'text-secondary border-transparent'}"
			aria-pressed={tab === 'booked'}
			onclick={() => (tab = 'booked')}>{i18n.t('myRides.booked')}</button
		><button
			class="border-b-2 px-4 py-3 font-bold {tab === 'hosted'
				? 'border-primary text-primary'
				: 'text-secondary border-transparent'}"
			aria-pressed={tab === 'hosted'}
			onclick={() => (tab = 'hosted')}>{i18n.t('myRides.hosted')}</button
		>
	</div>
	{#if loading}<div class="mt-8 grid gap-5 md:grid-cols-2">
			{#each [1, 2] as placeholder (placeholder)}<div
					class="bg-primary/5 h-48 animate-pulse rounded-2xl"
				></div>{/each}
		</div>
	{:else if error}<div class="mt-10 rounded-2xl bg-red-50 p-8 text-center">
			<p class="text-red-700">{i18n.t('myRides.error')}</p>
			<button
				class="bg-primary mt-4 rounded-lg px-4 py-2 font-bold text-white"
				onclick={() => void loadRides()}>{i18n.t('myRides.retry')}</button
			>
		</div>
	{:else if tab === 'booked'}
		<div class="mt-10 grid gap-5 md:grid-cols-2">
			{#each booked?.past ?? [] as ride (ride.bookingId)}
				<BookedRideCard {ride} phase="past" />{:else}
				<p class="text-secondary">{i18n.t('myRides.nothingPast')}</p>
			{/each}
		</div>
	{:else}
		<div class="mt-10 space-y-5">
			{#each hosted?.past ?? [] as ride (ride.rideId)}
				<HostedRideCard {ride} phase="past" />{:else}
				<p class="text-secondary">{i18n.t('myRides.nothingPast')}</p>
			{/each}
		</div>
	{/if}

	{#if eligibility.length > 0}
		<div class="mt-10">
			<ReviewsToWrite {eligibility} onChanged={loadEligibility} />
		</div>
	{/if}
</section>
