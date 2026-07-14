<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { createRide } from '$lib/api/rides.js';
	import { formatLocalizedDate, showDatePicker } from '$lib/utils/date.js';
	import type { CreateRideRequest, RideStopInput } from '$lib/types/ride.js';
	import type { LocationResult } from '$lib/types/location.js';
	import StopField from './StopField.svelte';

	// Backend `pricePerSeat` is a Java Short; keep the client-side cap in sync with that type.
	const MAX_PRICE_PER_SEAT = 32767;

	interface StopEntry {
		key: number;
		location: LocationResult | null;
	}

	let stopKeyCounter = 0;
	function createStop(): StopEntry {
		stopKeyCounter += 1;
		return { key: stopKeyCounter, location: null };
	}

	let stops = $state<StopEntry[]>([createStop(), createStop()]);
	let departureLocal = $state('');
	let seatsTotal = $state(1);
	let pricePerSeat = $state<number | null>(null);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	let hasAllStops = $derived(stops.every((stop) => stop.location !== null));

	function priceForStop(index: number): number {
		if (!pricePerSeat) return 0;
		if (index === 0) return 0;
		if (index === stops.length - 1) return pricePerSeat;
		return Math.round((pricePerSeat * index) / (stops.length - 1));
	}

	function addStop() {
		const last = stops[stops.length - 1];
		stops = [...stops.slice(0, -1), createStop(), last];
	}

	function removeStop(key: number) {
		stops = stops.filter((stop) => stop.key !== key);
	}

	function getDisplayDateTime(local: string): string {
		return formatLocalizedDate(new Date(local), i18n.lang, {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Reads every component back off the parsed Date instead of string-splicing `local`,
	// so it stays correct regardless of the datetime-local input's second/millisecond granularity.
	function toOffsetDateTime(local: string): string {
		const date = new Date(local);
		const pad = (n: number) => String(n).padStart(2, '0');

		const offsetMinutes = -date.getTimezoneOffset();
		const offsetSign = offsetMinutes >= 0 ? '+' : '-';
		const absOffset = Math.abs(offsetMinutes);
		const offset = `${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;

		const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
		const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

		return `${datePart}T${timePart}${offsetSign}${offset}`;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (submitting) return;
		error = null;

		const rideStops: RideStopInput[] = [];
		for (let i = 0; i < stops.length; i++) {
			const location = stops[i].location;
			if (!location) {
				error = i18n.t('publish.errorMinStops');
				return;
			}
			rideStops.push({
				id: location.id,
				type: location.type,
				stopOrder: i + 1,
				price: priceForStop(i)
			});
		}

		if (!Number.isInteger(seatsTotal) || seatsTotal < 1 || seatsTotal > 9) {
			error = i18n.t('publish.errorSeats');
			return;
		}
		if (
			pricePerSeat === null ||
			!Number.isInteger(pricePerSeat) ||
			pricePerSeat <= 0 ||
			pricePerSeat > MAX_PRICE_PER_SEAT
		) {
			error = i18n.t('publish.errorPrice');
			return;
		}
		if (!departureLocal || new Date(departureLocal) <= new Date()) {
			error = i18n.t('publish.errorPastDate');
			return;
		}

		submitting = true;

		try {
			const body: CreateRideRequest = {
				rideStops,
				seatsTotal,
				pricePerSeat,
				departureAt: toOffsetDateTime(departureLocal)
			};

			const rideId = await createRide(body);
			await goto(resolve(`/rides/${rideId}`));
		} catch (err) {
			error = err instanceof Error ? err.message : i18n.t('publish.errorGeneric');
		} finally {
			submitting = false;
		}
	}
</script>

<form
	onsubmit={handleSubmit}
	class="glass-panel border-outline-variant/20 rounded-xl border p-6 md:p-8"
>
	<div class="space-y-3">
		{#each stops as stop, i (stop.key)}
			<StopField
				id="publish-stop-{stop.key}"
				label={i === 0
					? i18n.t('publish.origin')
					: i === stops.length - 1
						? i18n.t('publish.destination')
						: `${i18n.t('publish.stop')} ${i}`}
				placeholder={i18n.t('publish.stopPlaceholder')}
				icon={i === 0 ? 'location_on' : i === stops.length - 1 ? 'near_me' : 'place'}
				price={priceForStop(i)}
				removable={i > 0 && i < stops.length - 1}
				onRemove={() => removeStop(stop.key)}
				bind:value={stop.location}
			/>
		{/each}
	</div>

	<button
		type="button"
		onclick={addStop}
		class="text-primary hover:bg-primary/5 mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors"
	>
		<span class="material-symbols-outlined text-lg" data-icon="add">add</span>
		{i18n.t('publish.addStop')}
	</button>

	<div class="ia-divider my-6 opacity-40"></div>

	<div class="grid gap-4 md:grid-cols-3">
		<div
			class="bg-surface-container-low/50 relative flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
		>
			<label
				for="publish-departure"
				class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
				>{i18n.t('publish.departure')}</label
			>
			<div class="flex items-center gap-3">
				<span class="material-symbols-outlined text-primary/70" data-icon="calendar_today"
					>calendar_today</span
				>
				<span
					class="text-base font-bold {departureLocal
						? 'text-on-surface'
						: 'text-outline-variant/60'}"
				>
					{departureLocal ? getDisplayDateTime(departureLocal) : i18n.t('publish.departurePick')}
				</span>
				<input
					id="publish-departure"
					type="datetime-local"
					bind:value={departureLocal}
					onclick={showDatePicker}
					class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
				/>
			</div>
		</div>

		<div
			class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
		>
			<label
				for="publish-seats"
				class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
				>{i18n.t('publish.seats')}</label
			>
			<div class="flex items-center gap-3">
				<span class="material-symbols-outlined text-primary/70" data-icon="person">person</span>
				<input
					id="publish-seats"
					type="number"
					min="1"
					max="9"
					step="1"
					bind:value={seatsTotal}
					class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
				/>
			</div>
		</div>

		<div
			class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
		>
			<label
				for="publish-price"
				class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
				>{i18n.t('publish.pricePerSeat')}</label
			>
			<div class="flex items-center gap-3">
				<span class="material-symbols-outlined text-primary/70" data-icon="payments">payments</span>
				<input
					id="publish-price"
					type="number"
					min="1"
					max="32767"
					step="1"
					bind:value={pricePerSeat}
					class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
				/>
			</div>
		</div>
	</div>

	{#if error}
		<div
			class="bg-error/5 border-error/10 mt-6 flex items-center gap-3 rounded-lg border px-4 py-3"
		>
			<span class="material-symbols-outlined text-error text-sm">error</span>
			<p class="font-body text-error text-sm">{error}</p>
		</div>
	{/if}

	<button
		type="submit"
		disabled={!hasAllStops || submitting}
		class="bg-primary-container font-headline hover:bg-primary mt-6 flex w-full items-center justify-center gap-3 rounded-lg px-10 py-4 text-lg font-bold text-white transition-all disabled:opacity-50 md:w-auto"
	>
		{submitting ? i18n.t('publish.submitting') : i18n.t('publish.submit')}
		{#if submitting}
			<span class="material-symbols-outlined animate-spin" data-icon="progress_activity"
				>progress_activity</span
			>
		{:else}
			<span class="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
		{/if}
	</button>
</form>
