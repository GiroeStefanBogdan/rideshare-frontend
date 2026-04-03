<script lang="ts">
	import type { UserCar } from '$lib/types/user';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
	import { createUserCar, deleteUserCar, updateUserCar } from '$lib/api/users';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';

	let { cars = $bindable() }: { cars: UserCar[] } = $props();

	let isEditing = $state(false);
	let editingCarId = $state<number | null>(null);
	let brand = $state('');
	let model = $state('');
	let color = $state('');
	let year = $state<number | null>(null);
	let licensePlate = $state('');
	let numberOfSeats = $state<number | null>(null);
	let isSaving = $state(false);
	let error = $state('');

	let showDeleteModal = $state(false);
	let carIdToDelete = $state<number | null>(null);

	function resetForm() {
		brand = '';
		model = '';
		color = '';
		year = null;
		licensePlate = '';
		numberOfSeats = null;
		editingCarId = null;
		isEditing = false;
		error = '';
	}

	function startAdd() {
		resetForm();
		isEditing = true;
	}

	function startEdit(car: UserCar) {
		brand = car.brand;
		model = car.model;
		color = car.color;
		year = car.year;
		licensePlate = car.licensePlate;
		numberOfSeats = car.numberOfSeats;
		editingCarId = car.id;
		isEditing = true;
		error = '';
	}

	async function handleSave() {
		if (!authStore.user?.id) return;
		if (!brand || !model || !color || !year || !licensePlate || !numberOfSeats) {
			error = 'All fields are required';
			return;
		}
		isSaving = true;
		error = '';

		const carData = {
			brand,
			model,
			color,
			year,
			licensePlate,
			numberOfSeats
		};

		try {
			if (editingCarId) {
				const updated = await updateUserCar(editingCarId, carData);
				cars = cars.map((c) => (c.id === updated.id ? updated : c));
			} else {
				const created = await createUserCar(carData);
				cars = [...cars, created];
			}
			resetForm();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save car';
		} finally {
			isSaving = false;
		}
	}

	function confirmDelete(carId: number) {
		carIdToDelete = carId;
		showDeleteModal = true;
	}

	async function handleDelete() {
		if (carIdToDelete === null) return;

		try {
			await deleteUserCar(carIdToDelete);
			cars = cars.filter((c) => c.id !== carIdToDelete);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to delete car';
		} finally {
			carIdToDelete = null;
		}
	}
</script>

<div
	class="bg-surface-container-lowest border-outline-variant/15 rounded-xl border p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)]"
>
	<div class="mb-5 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
				<span class="material-symbols-outlined text-primary-container">directions_car</span>
			</div>
			<h2 class="font-headline text-primary text-xl font-bold">{i18n.t('account.myCars')}</h2>
		</div>

		{#if !isEditing}
			<button
				onclick={startAdd}
				class="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-95"
			>
				<span class="material-symbols-outlined text-sm">add</span>
				{i18n.t('account.addCar')}
			</button>
		{/if}
	</div>

	{#if isEditing}
		<div class="bg-surface-container-low mb-6 space-y-4 rounded-lg p-4">
			<h3 class="font-headline text-on-surface text-sm font-bold">
				{editingCarId ? i18n.t('account.editCar') : i18n.t('account.addCar')}
			</h3>

			<div class="grid gap-4 sm:grid-cols-3">
				<div class="space-y-1">
					<label for="brand" class="font-label text-secondary text-[0.625rem] font-bold uppercase"
						>{i18n.t('account.carBrand')}</label
					>
					<input
						id="brand"
						bind:value={brand}
						type="text"
						class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
					/>
				</div>
				<div class="space-y-1">
					<label for="model" class="font-label text-secondary text-[0.625rem] font-bold uppercase"
						>{i18n.t('account.carModel')}</label
					>
					<input
						id="model"
						bind:value={model}
						type="text"
						class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
					/>
				</div>
				<div class="space-y-1">
					<label for="color" class="font-label text-secondary text-[0.625rem] font-bold uppercase"
						>{i18n.t('account.carColor')}</label
					>
					<input
						id="color"
						bind:value={color}
						type="text"
						class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
					/>
				</div>
				<div class="space-y-1">
					<label for="year" class="font-label text-secondary text-[0.625rem] font-bold uppercase"
						>{i18n.t('account.carYear')}</label
					>
					<input
						id="year"
						bind:value={year}
						type="number"
						min="1900"
						max="2100"
						class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
					/>
				</div>
				<div class="space-y-1">
					<label
						for="licensePlate"
						class="font-label text-secondary text-[0.625rem] font-bold uppercase"
						>{i18n.t('account.carLicensePlate')}</label
					>
					<input
						id="licensePlate"
						bind:value={licensePlate}
						type="text"
						class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
					/>
				</div>
				<div class="space-y-1">
					<label for="seats" class="font-label text-secondary text-[0.625rem] font-bold uppercase"
						>{i18n.t('account.carSeats')}</label
					>
					<input
						id="seats"
						bind:value={numberOfSeats}
						type="number"
						min="2"
						max="9"
						class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
					/>
				</div>
			</div>

			{#if error}
				<p class="font-body text-error text-xs">{error}</p>
			{/if}

			<div class="flex justify-end gap-2">
				<button
					onclick={resetForm}
					class="hover:bg-surface-container-high rounded-lg px-4 py-2 text-sm font-bold transition-all"
				>
					{i18n.t('account.cancel')}
				</button>
				<button
					onclick={handleSave}
					disabled={isSaving ||
						!brand ||
						!model ||
						!color ||
						!year ||
						!licensePlate ||
						!numberOfSeats}
					class="bg-primary hover:bg-primary/90 disabled:bg-primary/50 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all"
				>
					{isSaving ? i18n.t('account.updating') : i18n.t('account.saveCar')}
				</button>
			</div>
		</div>
	{/if}

	{#if cars.length === 0}
		<p class="font-body text-secondary text-sm">{i18n.t('account.noCars')}</p>
	{:else}
		<ul class="space-y-3">
			{#each cars as car (car.id)}
				<li class="bg-surface-container-low flex items-center justify-between rounded-lg px-4 py-3">
					<div class="flex items-center gap-3">
						<div class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
							<span class="material-symbols-outlined text-primary text-sm">directions_car</span>
						</div>
						<div>
							<p class="font-headline text-on-surface font-bold">{car.brand} {car.model}</p>
							<p
								class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
							>
								{car.color} • {car.year} • {car.licensePlate} • {car.numberOfSeats}
								{i18n.t('account.carSeats').toLowerCase()}
							</p>
						</div>
					</div>

					<div class="flex gap-1">
						<button
							onclick={() => startEdit(car)}
							class="hover:bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg transition-all"
							title={i18n.t('account.editCar')}
						>
							<span class="material-symbols-outlined text-lg">edit</span>
						</button>
						<button
							onclick={() => confirmDelete(car.id)}
							class="hover:bg-error/10 text-error flex h-8 w-8 items-center justify-center rounded-lg transition-all"
							title={i18n.t('account.deleteCar')}
						>
							<span class="material-symbols-outlined text-lg">delete</span>
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	<ConfirmationModal
		bind:show={showDeleteModal}
		title={i18n.t('account.deleteCar')}
		message={i18n.t('account.deleteConfirm')}
		onConfirm={handleDelete}
	/>
</div>
