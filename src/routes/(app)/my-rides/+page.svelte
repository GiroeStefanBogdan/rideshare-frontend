<script lang="ts">
	import { getMyRides, cancelBooking } from '$lib/api/rides';
	import BookedRideCard from '$lib/components/rides/BookedRideCard.svelte';
	import HostedRideCard from '$lib/components/rides/HostedRideCard.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import {
		type BookedRideView,
		type HostedRideView,
		bySchedule
	} from '$lib/rides/classification.svelte';
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
	let cancelTarget = $state<BookedRideView | null>(null);
	let cancelModalOpen = $state(false);
	let cancelling = $state(false);
	let cancelFailed = $state(false);
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
	// Fetch on mount only; explicit actions reload separately. No polling or focus refresh.
	$effect(() => {
		void loadRides();
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
		data
			? { upcoming: data.upcomingBookings.filter((r) => r.status === 'ACTIVE').map(bookedView) }
			: null
	);
	const hosted = $derived(
		data
			? { upcoming: data.upcomingHostedRides.filter((r) => r.status === 'ACTIVE').map(hostedView) }
			: null
	);
	const cancelledBookings = $derived(
		data
			? bySchedule(
					[...data.upcomingBookings, ...data.pastBookings]
						.map(bookedView)
						.filter((ride) => ride.status === 'CANCELLED')
				)
			: []
	);
	const cancelledHostedRides = $derived(
		data
			? bySchedule(
					[...data.upcomingHostedRides, ...data.pastHostedRides]
						.map(hostedView)
						.filter((ride) => ride.status === 'CANCELLED')
				)
			: []
	);
	async function confirmCancel(): Promise<void> {
		if (!cancelTarget || cancelling) return;
		cancelling = true;
		cancelFailed = false;
		try {
			await cancelBooking(cancelTarget.bookingId);
			cancelTarget = null;
			await loadRides();
		} catch {
			cancelFailed = true;
		} finally {
			cancelling = false;
		}
	}
</script>

<svelte:head><title>{i18n.t('myRides.title')}</title></svelte:head>
<section class="mx-auto w-full max-w-7xl px-8 py-12">
	<h1 class="font-headline text-primary text-4xl font-black">{i18n.t('myRides.title')}</h1>
	<div class="border-outline-variant/20 mt-8 flex gap-2 border-b">
		<button
			class="border-b-2 px-4 py-3 font-bold {tab === 'booked'
				? 'border-primary text-primary'
				: 'text-secondary border-transparent'}"
			aria-pressed={tab === 'booked'}
			onclick={() => (tab = 'booked')}
			>{i18n.t('myRides.booked')}
			{booked && cancelledBookings
				? `(${booked.upcoming.length + cancelledBookings.length})`
				: ''}</button
		><button
			class="border-b-2 px-4 py-3 font-bold {tab === 'hosted'
				? 'border-primary text-primary'
				: 'text-secondary border-transparent'}"
			aria-pressed={tab === 'hosted'}
			onclick={() => (tab = 'hosted')}
			>{i18n.t('myRides.hosted')}
			{hosted && cancelledHostedRides
				? `(${hosted.upcoming.length + cancelledHostedRides.length})`
				: ''}</button
		>
	</div>
	{#if loading}<div class="mt-8 grid gap-5 md:grid-cols-2">
			{#each [1, 2, 3, 4] as placeholder (placeholder)}<div
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
	{:else if data}
		{#if cancelFailed}<p role="alert" class="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
				{i18n.t('myRides.cancelError')}
			</p>{/if}
		{#if tab === 'booked'}
			<section class="mt-10">
				<h2 class="font-headline text-2xl font-bold">{i18n.t('myRides.upcoming')}</h2>
				<div class="mt-4 grid gap-5 md:grid-cols-2">
					{#each booked?.upcoming ?? [] as ride (ride.bookingId)}
						<BookedRideCard
							{ride}
							phase="upcoming"
							{cancelling}
							onCancel={() => {
								if (cancelling) return;
								cancelTarget = ride;
								cancelModalOpen = true;
							}}
						/>
					{:else}
						<p class="text-secondary">{i18n.t('myRides.nothingUpcoming')}</p>
					{/each}
				</div>
			</section>
			<section class="mt-10">
				<h2 class="font-headline text-2xl font-bold">{i18n.t('myRides.cancelled')}</h2>
				<div class="mt-4 grid gap-5 md:grid-cols-2">
					{#each cancelledBookings as ride (ride.bookingId)}
						<BookedRideCard {ride} phase="cancelled" />{:else}
						<p class="text-secondary">{i18n.t('myRides.nothingCancelled')}</p>
					{/each}
				</div>
			</section>
		{:else}
			<section class="mt-10">
				<h2 class="font-headline text-2xl font-bold">{i18n.t('myRides.upcoming')}</h2>
				<div class="mt-4 space-y-5">
					{#each hosted?.upcoming ?? [] as ride (ride.rideId)}
						<HostedRideCard {ride} phase="upcoming" />{:else}
						<p class="text-secondary">{i18n.t('myRides.nothingUpcoming')}</p>
					{/each}
				</div>
			</section>
			<section class="mt-10">
				<h2 class="font-headline text-2xl font-bold">{i18n.t('myRides.cancelled')}</h2>
				<div class="mt-4 space-y-5">
					{#each cancelledHostedRides as ride (ride.rideId)}
						<HostedRideCard {ride} phase="cancelled" />{:else}
						<p class="text-secondary">{i18n.t('myRides.nothingCancelled')}</p>
					{/each}
				</div>
			</section>
		{/if}
		<a
			class="text-primary mt-10 inline-block text-sm font-bold underline"
			href={resolve(`/my-rides/past?role=${tab}`)}>{i18n.t('myRides.viewPast')}</a
		>
	{/if}
</section>
<ConfirmationModal
	bind:show={cancelModalOpen}
	title={i18n.t('myRides.cancelConfirmTitle')}
	message={i18n.t('myRides.cancelConfirmMessage')}
	confirmText={i18n.t('myRides.cancelBooking')}
	onConfirm={() => void confirmCancel()}
/>
