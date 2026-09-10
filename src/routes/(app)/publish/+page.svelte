<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import LocationAutocomplete from '$lib/components/ui/LocationAutocomplete.svelte';
	import { publishRide } from '$lib/api/rides';
	import { getUserCars } from '$lib/api/users';
	import { ApiError } from '$lib/api/client';
	import { i18n } from '$lib/stores/i18n.svelte';
	import type { LocationResult } from '$lib/types/location';
	import type { UserCar } from '$lib/types/user';

	type DraftStop = {
		clientId: number;
		location: LocationResult | null;
		durationHours?: number;
		durationMinutes?: number;
		cumulativePrice: number | null;
	};

	function localDateValue(date: Date) {
		const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
		return local.toISOString().slice(0, 10);
	}

	let nextStopId = 3;
	let step = $state(1);
	let stops = $state<DraftStop[]>([
		{ clientId: 1, location: null, cumulativePrice: 0 },
		{ clientId: 2, location: null, cumulativePrice: null }
	]);
	let departureDate = $state('');
	let departureTime = $state('');
	let scheduleInitialized = $state(false);
	let cars = $state<UserCar[]>([]);
	let selectedCarId = $state<number | null>(null);
	let seatsTotal = $state(3);
	let carsWarning = $state('');
	let error = $state('');
	let submitting = $state(false);
	let dirty = $state(false);
	let published = $state(false);

	const steps = $derived([
		i18n.t('publish.route'),
		i18n.t('publish.schedule'),
		i18n.t('publish.details'),
		i18n.t('publish.review')
	]);
	const currentCar = $derived(cars.find((car) => car.id === selectedCarId) ?? null);
	const totalPrice = $derived(stops.at(-1)?.cumulativePrice ?? 0);

	onMount(() => {
		void loadCars();
		const preventUnload = (event: BeforeUnloadEvent) => {
			if (dirty && !published) event.preventDefault();
		};
		window.addEventListener('beforeunload', preventUnload);
		return () => window.removeEventListener('beforeunload', preventUnload);
	});

	beforeNavigate(({ cancel }) => {
		if (dirty && !published && !window.confirm(i18n.t('publish.leaveWarning'))) cancel();
	});

	async function loadCars() {
		try {
			cars = (await getUserCars()).sort((a, b) => a.id - b.id);
			if (cars.length > 0) {
				selectedCarId = cars[0].id;
				seatsTotal = Math.min(Math.max(cars[0].numberOfSeats - 1, 1), 4);
			}
		} catch {
			carsWarning = i18n.t('publish.carsWarning');
		}
	}

	function markDirty() {
		dirty = true;
		error = '';
	}

	function selectCar(event: Event) {
		const value = (event.currentTarget as HTMLSelectElement).value;
		selectedCarId = value ? Number(value) : null;
		const car = cars.find((candidate) => candidate.id === selectedCarId);
		seatsTotal = car ? Math.min(Math.max(car.numberOfSeats - 1, 1), 4) : 3;
		markDirty();
	}

	function localTimeValue(date: Date) {
		const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
		return local.toISOString().slice(11, 16);
	}

	function openNativePicker(event: MouseEvent) {
		(event.currentTarget as HTMLInputElement).showPicker?.();
	}

	function initializeSchedule() {
		if (scheduleInitialized) return;
		const rounded = new Date(Math.ceil(Date.now() / 300_000) * 300_000);
		departureDate = localDateValue(rounded);
		departureTime = localTimeValue(rounded);
		scheduleInitialized = true;
	}

	function maximumDate() {
		const now = new Date();
		return localDateValue(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()));
	}

	function departureTimestamp() {
		return new Date(`${departureDate}T${departureTime}`).getTime();
	}

	function segmentMinutes(stop: DraftStop) {
		return (stop.durationHours ?? 0) * 60 + (stop.durationMinutes ?? 0);
	}

	function updateDuration(stop: DraftStop, changedField: 'hours' | 'minutes') {
		if (
			changedField === 'hours' &&
			stop.durationHours !== undefined &&
			stop.durationMinutes === undefined
		) {
			stop.durationMinutes = 0;
		}
		if (
			changedField === 'minutes' &&
			stop.durationMinutes !== undefined &&
			stop.durationHours === undefined
		) {
			stop.durationHours = 0;
		}
		markDirty();
	}

	function scheduledTimestamp(index: number) {
		let timestamp = departureTimestamp();
		for (let stopIndex = 1; stopIndex <= index; stopIndex += 1) {
			timestamp += segmentMinutes(stops[stopIndex]) * 60_000;
		}
		return timestamp;
	}

	function formatScheduledTime(index: number) {
		const timestamp = scheduledTimestamp(index);
		if (!Number.isFinite(timestamp)) return '—';
		return new Intl.DateTimeFormat(i18n.lang === 'ro' ? 'ro-RO' : 'en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(timestamp);
	}

	function existingSegments() {
		return new Map(
			stops
				.slice(1)
				.map((stop, index) => [
					`${stops[index].clientId}:${stop.clientId}`,
					{ hours: stop.durationHours, minutes: stop.durationMinutes }
				])
		);
	}

	function restoreUnchangedSegments(
		segments: Map<string, { hours: number | undefined; minutes: number | undefined }>
	) {
		stops.slice(1).forEach((stop, index) => {
			const duration = segments.get(`${stops[index].clientId}:${stop.clientId}`);
			stop.durationHours = duration?.hours;
			stop.durationMinutes = duration?.minutes;
		});
	}

	function addStop() {
		if (stops.length >= 7) return;
		const segments = existingSegments();
		stops.splice(stops.length - 1, 0, {
			clientId: nextStopId++,
			location: null,
			cumulativePrice: null
		});
		restoreUnchangedSegments(segments);
		clearPrices();
	}

	function removeStop(index: number) {
		const segments = existingSegments();
		stops.splice(index, 1);
		restoreUnchangedSegments(segments);
		clearPrices();
		markDirty();
	}

	function moveStop(index: number, direction: -1 | 1) {
		const destination = index + direction;
		if (
			index <= 0 ||
			index >= stops.length - 1 ||
			destination <= 0 ||
			destination >= stops.length - 1
		)
			return;
		const segments = existingSegments();
		[stops[index], stops[destination]] = [stops[destination], stops[index]];
		restoreUnchangedSegments(segments);
		stops = [...stops];
		clearPrices();
		markDirty();
	}

	function clearPrices() {
		stops.forEach((stop, index) => (stop.cumulativePrice = index === 0 ? 0 : null));
	}

	function routeValid() {
		if (stops.some((stop) => !stop.location)) return false;
		const ids = stops.map((stop) => stop.location?.id);
		return new Set(ids).size === ids.length;
	}

	function scheduleValid() {
		if (!departureDate || !departureTime) return false;
		const durationsValid = stops.slice(1).every((stop) => {
			const hours = stop.durationHours;
			const minutes = stop.durationMinutes;
			if (hours === undefined || minutes === undefined) return false;
			return (
				Number.isInteger(hours) &&
				Number.isInteger(minutes) &&
				hours >= 0 &&
				hours <= 99 &&
				minutes >= 0 &&
				minutes <= 59 &&
				hours * 60 + minutes >= 1
			);
		});
		if (!durationsValid) return false;
		const departure = departureTimestamp();
		const now = Date.now();
		const current = new Date();
		const latest = new Date(
			current.getFullYear(),
			current.getMonth() + 1,
			current.getDate(),
			current.getHours(),
			current.getMinutes()
		);
		return Number.isFinite(departure) && departure > now && departure <= latest.getTime();
	}

	function detailsValid() {
		if (seatsTotal < 1 || seatsTotal > 4) return false;
		return stops.every((stop, index) => {
			if (index === 0) return stop.cumulativePrice === 0;
			const previous = stops[index - 1].cumulativePrice;
			return (
				stop.cumulativePrice !== null &&
				stop.cumulativePrice <= 32767 &&
				previous !== null &&
				stop.cumulativePrice > previous
			);
		});
	}

	function validateCurrentStep() {
		const valid =
			step === 1
				? routeValid()
				: step === 2
					? scheduleValid()
					: step === 3
						? detailsValid()
						: routeValid() && scheduleValid() && detailsValid();
		error = valid ? '' : i18n.t(`publish.step${step}Error`);
		return valid;
	}

	function next() {
		markDirty();
		if (validateCurrentStep()) {
			step += 1;
			if (step === 2) initializeSchedule();
		}
	}

	function localOffsetDateTime(timestamp: number) {
		const date = new Date(timestamp);
		const value = `${localDateValue(date)}T${localTimeValue(date)}`;
		const offset = -date.getTimezoneOffset();
		const sign = offset >= 0 ? '+' : '-';
		const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
		const minutes = String(Math.abs(offset) % 60).padStart(2, '0');
		return `${value}:00${sign}${hours}:${minutes}`;
	}

	async function submit() {
		if (!validateCurrentStep() || submitting) return;
		submitting = true;
		try {
			const rideId = await publishRide({
				rideStops: stops.map((stop, index) => ({
					id: stop.location!.id,
					type: stop.location!.type,
					stopOrder: index + 1,
					cumulativePricePerSeat: stop.cumulativePrice!,
					departsAt: localOffsetDateTime(scheduledTimestamp(index))
				})),
				seatsTotal,
				carId: selectedCarId
			});
			if (rideId === null) {
				throw new Error(i18n.t('publish.publishError'));
			}
			published = true;
			dirty = false;
			await goto(resolve(`/rides/${rideId}`));
		} catch (caught) {
			error = caught instanceof ApiError ? caught.message : i18n.t('publish.publishError');
		} finally {
			submitting = false;
		}
	}

	function stopLabel(index: number) {
		if (index === 0) return i18n.t('publish.origin');
		if (index === stops.length - 1) return i18n.t('publish.destination');
		return `${i18n.t('publish.stop')} ${index}`;
	}

	function stopName(index: number) {
		return stops[index].location?.fullName ?? stopLabel(index);
	}
</script>

<main class="folk-pattern-bg bg-surface text-on-surface min-h-screen px-4 py-12 md:py-16">
	<div class="mx-auto max-w-6xl">
		<header class="mx-auto mb-10 max-w-2xl text-center">
			<p class="text-primary-container text-xs font-semibold tracking-widest uppercase">
				{i18n.t('publish.eyebrow')}
			</p>
			<h1 class="mt-3 text-4xl font-bold tracking-tight">{i18n.t('publish.title')}</h1>
		</header>

		<nav
			aria-label={i18n.t('publish.progress')}
			class="relative mb-10 grid grid-cols-4 gap-2 rounded-lg bg-white p-2 shadow-sm"
		>
			<div class="col-span-4 px-2 py-2 sm:hidden">
				<p class="text-on-surface-variant text-xs font-semibold tracking-widest uppercase">
					{i18n.t('publish.step')}
					{step}
					{i18n.t('publish.of')} 4
				</p>
				<p class="mt-1 text-xl font-semibold">{steps[step - 1]}</p>
				<div class="mt-3 grid grid-cols-4 gap-2" aria-hidden="true">
					{#each steps as label, index (label)}<span
							data-step={label}
							class="h-1 rounded-lg {index + 1 <= step ? 'bg-primary-container' : 'bg-heritage'}"
						></span>{/each}
				</div>
			</div>
			{#each steps as label, index (label)}
				<button
					type="button"
					onclick={() => index + 1 < step && (step = index + 1)}
					disabled={index + 1 > step}
					class="hidden rounded-lg px-2 py-3 text-xs font-semibold tracking-widest uppercase transition-all duration-200 sm:block {index +
						1 ===
					step
						? 'bg-primary-container text-white'
						: index + 1 < step
							? 'bg-primary-fixed text-primary'
							: 'text-on-surface-variant bg-surface-container-low'} disabled:opacity-60"
					>{index + 1}. {label}</button
				>
			{/each}
		</nav>

		<div class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
			<section
				class="ia-border-accent border-outline-variant/30 rounded-lg border bg-white p-6 shadow-md md:p-8"
			>
				{#if step === 1}
					<h2 class="mb-6 text-2xl font-semibold">{i18n.t('publish.routeTitle')}</h2>
					<p class="text-on-surface-variant mb-7 text-base leading-relaxed">
						{i18n.t('publish.routeIntro')}
					</p>
					<div
						class="before:bg-primary-fixed-dim relative space-y-4 before:absolute before:top-10 before:bottom-10 before:left-5 before:w-px"
					>
						{#each stops as stop, index (stop.clientId)}
							<div
								class="border-outline-variant/30 focus-within:border-primary-container relative flex flex-col items-stretch gap-2 rounded-lg border bg-white p-2 pl-10 shadow-sm transition-all duration-200 focus-within:shadow-md sm:flex-row sm:items-center"
								oninput={markDirty}
							>
								<span
									class="absolute left-[0.8rem] z-10 h-4 w-4 rounded-full border-4 border-white {index ===
									0
										? 'bg-primary-container'
										: index === stops.length - 1
											? 'bg-tertiary-container'
											: 'bg-primary-fixed-dim'}"
								></span>
								<LocationAutocomplete
									id={`publish-stop-${stop.clientId}`}
									label={stopLabel(index)}
									placeholder={i18n.t('publish.locationPlaceholder')}
									icon={index === stops.length - 1 ? 'flag' : 'location_on'}
									bind:value={stop.location}
								/>
								{#if index > 0 && index < stops.length - 1}
									<div class="flex flex-row justify-end gap-1 sm:flex-col">
										<button
											type="button"
											aria-label={i18n.t('publish.moveUp')}
											onclick={() => moveStop(index, -1)}
											disabled={index === 1}
											class="hover:bg-surface-container rounded-lg p-2 disabled:opacity-30"
											><span class="material-symbols-outlined">arrow_upward</span></button
										>
										<button
											type="button"
											aria-label={i18n.t('publish.moveDown')}
											onclick={() => moveStop(index, 1)}
											disabled={index === stops.length - 2}
											class="hover:bg-surface-container rounded-lg p-2 disabled:opacity-30"
											><span class="material-symbols-outlined">arrow_downward</span></button
										>
										<button
											type="button"
											aria-label={i18n.t('publish.remove')}
											onclick={() => removeStop(index)}
											class="rounded-lg p-2 text-red-700 hover:bg-red-50"
											><span class="material-symbols-outlined">delete</span></button
										>
									</div>
								{/if}
							</div>
						{/each}
					</div>
					<button
						type="button"
						onclick={addStop}
						disabled={stops.length >= 7}
						class="border-primary-container text-primary-container hover:bg-primary-fixed mt-6 rounded-lg border px-5 py-3 font-semibold transition-colors duration-150 disabled:opacity-40"
						>+ {i18n.t('publish.addStop')}</button
					>
				{:else if step === 2}
					<h2 class="mb-6 text-2xl font-semibold">{i18n.t('publish.scheduleTitle')}</h2>
					<p class="text-on-surface-variant mb-6 text-base leading-relaxed">
						{i18n.t('publish.scheduleIntro')}
					</p>
					<div class="space-y-4">
						<fieldset
							class="border-outline-variant/30 bg-surface-container-low/40 rounded-lg border p-4"
						>
							<legend class="px-1 text-xs font-semibold tracking-widest uppercase"
								>{i18n.t('publish.departure')}</legend
							>
							<div class="mt-2 grid min-w-0 gap-4 sm:grid-cols-2">
								<label class="block">
									<span class="text-on-surface-variant mb-2 block text-sm font-semibold"
										>{i18n.t('publish.date')}</span
									>
									<input
										type="date"
										onclick={openNativePicker}
										min={localDateValue(new Date())}
										max={maximumDate()}
										bind:value={departureDate}
										onchange={markDirty}
										class="border-outline-variant/30 focus:border-primary-container h-12 w-full min-w-0 cursor-pointer rounded-lg border bg-white px-4 outline-none"
									/>
								</label>
								<label class="block">
									<span class="text-on-surface-variant mb-2 block text-sm font-semibold"
										>{i18n.t('publish.time')}</span
									>
									<input
										type="time"
										onclick={openNativePicker}
										step="60"
										bind:value={departureTime}
										onchange={markDirty}
										class="border-outline-variant/30 focus:border-primary-container h-12 w-full min-w-0 cursor-pointer rounded-lg border bg-white px-4 outline-none"
									/>
								</label>
							</div>
						</fieldset>
						{#each stops.slice(1) as stop, relativeIndex (stop.clientId)}
							{@const index = relativeIndex + 1}
							<fieldset class="border-outline-variant/30 rounded-lg border bg-white p-4">
								<legend class="px-1 text-xs font-semibold tracking-widest uppercase"
									>{stopName(index)}</legend
								>
								<p class="text-on-surface-variant mt-1 text-sm">
									{i18n.t('publish.from')}
									{stopName(index - 1)}
								</p>
								<div class="mt-3 grid grid-cols-2 gap-3 sm:max-w-sm">
									<label
										><span class="text-on-surface-variant mb-2 block text-sm font-semibold"
											>{i18n.t('publish.hours')}</span
										><input
											type="number"
											min="0"
											max="99"
											inputmode="numeric"
											placeholder="0"
											bind:value={stop.durationHours}
											onchange={() => updateDuration(stop, 'hours')}
											class="border-outline-variant/30 focus:border-primary-container h-12 w-full min-w-0 rounded-lg border bg-white px-4 outline-none"
										/></label
									>
									<label
										><span class="text-on-surface-variant mb-2 block text-sm font-semibold"
											>{i18n.t('publish.minutes')}</span
										><input
											type="number"
											min="0"
											max="59"
											inputmode="numeric"
											placeholder="0"
											bind:value={stop.durationMinutes}
											onchange={() => updateDuration(stop, 'minutes')}
											class="border-outline-variant/30 focus:border-primary-container h-12 w-full min-w-0 rounded-lg border bg-white px-4 outline-none"
										/></label
									>
								</div>
								<div class="bg-heritage text-charcoal mt-4 rounded-lg px-4 py-3">
									<span class="text-xs font-semibold tracking-widest uppercase"
										>{i18n.t('publish.estimatedArrival')}</span
									>
									<p class="mt-1 text-base font-semibold">{formatScheduledTime(index)}</p>
								</div>
							</fieldset>
						{/each}
					</div>
				{:else if step === 3}
					<h2 class="mb-6 text-2xl font-semibold">{i18n.t('publish.detailsTitle')}</h2>
					{#if carsWarning}<p class="mb-4 rounded-lg bg-amber-50 p-3 text-sm">{carsWarning}</p>{/if}
					<label class="mb-5 block"
						><span class="mb-2 block text-xs font-semibold tracking-widest uppercase"
							>{i18n.t('publish.vehicle')}</span
						><select
							value={selectedCarId ?? ''}
							onchange={selectCar}
							class="border-outline-variant/30 w-full rounded-lg border p-3"
							><option value="">{i18n.t('publish.noVehicle')}</option
							>{#each cars as car (car.id)}<option value={car.id}
									>{car.brand} {car.model} · {car.licensePlate}</option
								>{/each}</select
						></label
					>
					<label class="mb-8 block"
						><span class="mb-2 block text-xs font-semibold tracking-widest uppercase"
							>{i18n.t('publish.capacity')}</span
						><input
							type="number"
							min="1"
							max="4"
							bind:value={seatsTotal}
							onchange={markDirty}
							class="border-outline-variant/30 w-full rounded-lg border p-3"
						/></label
					>
					<div class="space-y-4">
						{#each stops as stop, index (stop.clientId)}
							{#if index > 0}
								<label class="block"
									><span class="mb-2 block text-xs font-semibold tracking-widest uppercase"
										>{stopName(index)} · {i18n.t('publish.cumulativePrice')}</span
									><input
										type="number"
										placeholder={i18n.t('publish.pricePlaceholder')}
										min={(stops[index - 1].cumulativePrice ?? 0) + 1}
										max="32767"
										bind:value={stop.cumulativePrice}
										onchange={markDirty}
										class="border-outline-variant/30 w-full rounded-lg border p-3"
									/><span class="text-on-surface/70 mt-1 block text-sm"
										>{i18n.t('publish.segmentPrice')}: {stop.cumulativePrice !== null &&
										stops[index - 1].cumulativePrice !== null
											? stop.cumulativePrice - stops[index - 1].cumulativePrice!
											: '—'} RON</span
									></label
								>
							{/if}
						{/each}
					</div>
				{:else}
					<h2 class="mb-6 text-2xl font-semibold">{i18n.t('publish.reviewTitle')}</h2>
					<ol class="space-y-4">
						{#each stops as stop, index (stop.clientId)}
							<li
								class="border-outline-variant/30 bg-surface-container-low/60 rounded-lg border p-4"
							>
								<p class="text-xs font-semibold tracking-widest uppercase">{stopName(index)}</p>
								<p class="text-xl font-semibold">{stop.location?.fullName}</p>
								<p class="text-base leading-relaxed font-normal">
									{formatScheduledTime(index)}{index > 0 ? ` · ${stop.cumulativePrice} RON` : ''}
								</p>
							</li>
						{/each}
					</ol>
					<div class="mt-6 grid gap-4 md:grid-cols-3">
						<p><strong>{i18n.t('publish.total')}:</strong> {totalPrice} RON</p>
						<p><strong>{i18n.t('publish.capacity')}:</strong> {seatsTotal}</p>
						<p>
							<strong>{i18n.t('publish.vehicle')}:</strong>
							{currentCar ? `${currentCar.brand} ${currentCar.model}` : i18n.t('publish.noVehicle')}
						</p>
					</div>
				{/if}

				{#if error}<p role="alert" class="mt-5 rounded-lg bg-red-50 p-3 text-red-800">
						{error}
					</p>{/if}
				<div class="mt-8 flex justify-between gap-3">
					<button
						type="button"
						onclick={() => (step -= 1)}
						disabled={step === 1 || submitting}
						class="border-outline text-on-surface hover:bg-surface-container-low rounded-lg border px-5 py-3 font-semibold transition-colors duration-150 disabled:opacity-30"
						>{i18n.t('publish.back')}</button
					>
					{#if step < 4}<button
							type="button"
							onclick={next}
							class="bg-primary-container rounded-lg px-6 py-3 font-semibold text-white transition-opacity duration-150 hover:opacity-90"
							>{i18n.t('publish.continue')}</button
						>{:else}<button
							type="button"
							onclick={submit}
							disabled={submitting}
							class="bg-primary-container rounded-lg px-6 py-3 font-semibold text-white transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
							>{submitting ? i18n.t('publish.publishing') : i18n.t('publish.publish')}</button
						>{/if}
				</div>
			</section>

			<aside
				class="border-outline-variant/30 sticky top-24 hidden overflow-hidden rounded-lg border bg-white shadow-md lg:block"
			>
				<div class="bg-primary px-6 py-6 text-white">
					<span class="material-symbols-outlined mb-3 text-3xl">route</span>
					<h2 class="text-2xl font-semibold">{i18n.t('publish.asideTitle')}</h2>
					<p class="text-primary-fixed mt-2 text-sm leading-relaxed">
						{i18n.t('publish.asideIntro')}
					</p>
				</div>
				<div class="space-y-5 p-6">
					{#each [i18n.t('publish.asideRoute'), i18n.t('publish.asideSchedule'), i18n.t('publish.asidePrice')] as tip, index (tip)}
						<div class="flex gap-3">
							<span
								class="bg-primary-fixed text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
								>{index + 1}</span
							>
							<p class="text-on-surface-variant text-sm leading-relaxed">{tip}</p>
						</div>
					{/each}
				</div>
				<div class="border-outline-variant/30 bg-surface-container-low border-t p-6">
					<p class="text-xs font-semibold tracking-widest uppercase">
						{i18n.t('publish.communityLabel')}
					</p>
					<p class="text-on-surface-variant mt-2 text-sm leading-relaxed">
						{i18n.t('publish.communityText')}
					</p>
				</div>
			</aside>
		</div>
	</div>
</main>
