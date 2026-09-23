<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { updateUserPreferences } from '$lib/api/users';
	import { i18n } from '$lib/stores/i18n.svelte';

	let canSmoke = $state(false);
	let petFriendly = $state(false);
	let saving = $state(false);
	let successMsg = $state('');
	let errorMsg = $state('');

	const user = $derived(authStore.user);

	// Initialize from current user data
	$effect(() => {
		if (user?.canSmoke !== undefined) {
			canSmoke = !!user.canSmoke;
		}
		if (user?.petFriendly !== undefined) {
			petFriendly = !!user.petFriendly;
		}
	});

	async function handleUpdatePreferences() {
		if (!user) return;
		errorMsg = '';
		successMsg = '';
		saving = true;
		try {
			await updateUserPreferences({
				canSmoke: canSmoke,
				petFriendly: petFriendly
			});
			successMsg = i18n.t('account.preferencesSaved');
			// Re-fetch user to update store
			await authStore.refresh();
		} catch {
			errorMsg = i18n.t('account.preferencesError');
		} finally {
			saving = false;
		}
	}
</script>

<div class="border-heritage rounded-lg border bg-white p-6 shadow-md">
	<div class="mb-5 flex items-center gap-3">
		<div class="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
			<span class="material-symbols-outlined text-primary-container">zone_person_urgent</span>
		</div>
		<h2 class="font-headline text-primary text-xl font-bold">
			{i18n.t('account.preferencesTitle')}
		</h2>
	</div>

	<div class="space-y-6">
		<p class="font-body text-secondary text-sm">
			{i18n.t('account.preferencesDescription')}
		</p>

		<div class="space-y-4">
			<label class="flex cursor-pointer items-center justify-between gap-4">
				<div>
					<span class="font-headline text-primary text-sm font-bold">
						{i18n.t('account.smokingAllowed')}
					</span>
					<p class="text-secondary text-xs">{i18n.t('account.smokingAllowedHint')}</p>
				</div>
				<input
					type="checkbox"
					bind:checked={canSmoke}
					class="text-primary focus:ring-primary h-5 w-5 rounded border-gray-300"
				/>
			</label>

			<label class="flex cursor-pointer items-center justify-between gap-4">
				<div>
					<span class="font-headline text-primary text-sm font-bold">
						{i18n.t('account.petFriendly')}
					</span>
					<p class="text-secondary text-xs">{i18n.t('account.petFriendlyHint')}</p>
				</div>
				<input
					type="checkbox"
					bind:checked={petFriendly}
					class="text-primary focus:ring-primary h-5 w-5 rounded border-gray-300"
				/>
			</label>
		</div>

		{#if errorMsg}
			<div
				class="bg-error/5 border-error/10 flex items-center gap-3 rounded-lg border px-4 py-3"
			>
				<span class="material-symbols-outlined text-error text-sm">error</span>
				<p class="font-body text-error text-sm">{errorMsg}</p>
			</div>
		{/if}

		{#if successMsg}
			<div
				class="bg-success/5 border-success/10 flex items-center gap-3 rounded-lg border px-4 py-3"
			>
				<span class="material-symbols-outlined text-success text-sm">check_circle</span>
				<p class="font-body text-success text-sm">{successMsg}</p>
			</div>
		{/if}

		<button
			onclick={handleUpdatePreferences}
			disabled={saving}
			class="bg-primary hover:bg-primary-container font-headline flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-45"
		>
			{#if saving}
				<span class="material-symbols-outlined animate-spin text-sm"
					>progress_activity</span
				>
			{/if}
			<span>{i18n.t('account.savePreferences')}</span>
		</button>
	</div>
</div>
