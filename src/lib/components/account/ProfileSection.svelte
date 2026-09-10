<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { deleteMyAccount, updateUserProfile } from '$lib/api/users';
	import { ApiError } from '$lib/api/client';
	import { goto } from '$app/navigation';
	import { i18n } from '$lib/stores/i18n.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import { resolve } from '$app/paths';

	let deleting = $state(false);
	let error = $state('');
	let showConfirm = $state(false);
	let editing = $state(false);
	let saving = $state(false);
	let name = $state('');
	let email = $state('');
	let phoneNumber = $state('');
	let birthday = $state('');
	let gender = $state<'MALE' | 'FEMALE'>('MALE');

	const user = $derived(authStore.user);
	const genderLabel = $derived(
		user?.gender === 'MALE' ? i18n.t('account.male') : i18n.t('account.female')
	);
	const roleLabel = $derived(
		user?.role === 'ROLE_ADMIN' ? i18n.t('account.admin') : i18n.t('account.user')
	);

	async function handleDeleteAccount() {
		if (!user) return;
		deleting = true;
		error = '';
		try {
			await deleteMyAccount();
			authStore.clear();
			await goto(resolve('/login?accountDeleted=true'));
		} catch {
			error = i18n.t('account.errorDelete');
			deleting = false;
			showConfirm = false;
		}
	}

	async function handleUpdateProfile() {
		if (!user) return;
		error = '';
		saving = true;
		try {
			const updatedUser = await updateUserProfile({
				name,
				email,
				phoneNumber,
				birthday,
				gender
			});
			authStore.setUser(updatedUser);
			editing = false;
		} catch (e) {
			if (e instanceof ApiError) {
				try {
					const parsed = JSON.parse(e.message);
					error = parsed.message ?? e.message;
				} catch {
					error = e.message;
				}
			} else {
				error = i18n.t('userProfile.errorUpdate');
			}
		} finally {
			saving = false;
		}
	}
</script>

<div class="border-heritage rounded-lg border bg-white p-6 shadow-md">
	<div class="mb-5 flex items-center gap-3">
		<div class="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
			<span class="material-symbols-outlined text-primary-container">badge</span>
		</div>
		<h2 class="font-headline text-primary text-xl font-bold">{i18n.t('account.profileTitle')}</h2>
	</div>

	{#if user}
		{#if editing}
			<!-- form with inputs for editing profile -->
			<div class="bg-surface-container-low mb-6 space-y-4 rounded-lg p-4">
				<h3 class="font-headline text-on-surface text-sm font-bold">
					{i18n.t('userProfile.editProfile')}
				</h3>

				<div class="grid gap-4 sm:grid-cols-3">
					<div class="space-y-1">
						<label for="name" class="font-label text-secondary text-[0.625rem] font-bold uppercase"
							>{i18n.t('userProfile.name')}</label
						>
						<input
							id="name"
							bind:value={name}
							type="text"
							class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
						/>
					</div>
					<div class="space-y-1">
						<label for="email" class="font-label text-secondary text-[0.625rem] font-bold uppercase"
							>{i18n.t('userProfile.email')}</label
						>
						<input
							id="email"
							bind:value={email}
							type="email"
							class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
						/>
					</div>
					<div class="space-y-1">
						<label
							for="phoneNumber"
							class="font-label text-secondary text-[0.625rem] font-bold uppercase"
							>{i18n.t('userProfile.phoneNumber')}</label
						>
						<input
							id="phoneNumber"
							bind:value={phoneNumber}
							type="text"
							class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
						/>
					</div>
					<div class="space-y-1">
						<label
							for="birthday"
							class="font-label text-secondary text-[0.625rem] font-bold uppercase"
							>{i18n.t('userProfile.birthday')}</label
						>
						<input
							id="birthday"
							bind:value={birthday}
							type="date"
							class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
						/>
					</div>
					<div class="space-y-1">
						<label
							for="gender"
							class="font-label text-secondary text-[0.625rem] font-bold uppercase"
							>{i18n.t('userProfile.gender')}</label
						>
						<select
							id="gender"
							bind:value={gender}
							class="bg-surface-container-lowest border-outline-variant focus:border-primary/40 w-full rounded-lg border px-3 py-2 text-sm transition-all outline-none"
						>
							<option value="MALE">{i18n.t('userProfile.male')}</option>
							<option value="FEMALE">{i18n.t('userProfile.female')}</option>
						</select>
					</div>
				</div>
			</div>
		{:else}
			<dl class="space-y-3">
				{#each [{ label: i18n.t('account.name'), value: user.name }, { label: i18n.t('account.email'), value: user.email }, { label: i18n.t('account.birthday'), value: user.birthday }, { label: i18n.t('account.gender'), value: genderLabel }, { label: i18n.t('account.phone'), value: user.phoneNumber }, { label: i18n.t('account.role'), value: roleLabel }, { label: i18n.t('account.provider'), value: user.provider }] as row (row.label)}
					<div
						class="border-outline-variant/10 flex items-center justify-between border-b py-2 last:border-0"
					>
						<dt
							class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
						>
							{row.label}
						</dt>
						<dd class="font-body text-on-surface text-sm font-semibold">{row.value}</dd>
					</div>
				{/each}
			</dl>
		{/if}

		<div class="border-outline-variant/10 mt-6 border-t pt-4">
			{#if error}
				<div
					class="bg-error/5 border-error/10 mb-4 flex items-center gap-3 rounded-lg border px-4 py-3"
				>
					<span class="material-symbols-outlined text-error text-sm">error</span>
					<p class="text-error text-sm">{error}</p>
				</div>
			{/if}

			<button
				onclick={() => (showConfirm = true)}
				class="border-error/30 font-headline text-error hover:bg-error rounded-lg border px-4 py-2 text-sm font-bold transition hover:text-white"
			>
				{i18n.t('account.deleteAccount')}
			</button>
			{#if editing}
				<button
					onclick={() => {
						editing = false;
						error = '';
					}}
					class="border-outline/30 font-headline text-secondary hover:bg-surface-container rounded-lg border px-4 py-2 text-sm font-bold transition"
				>
					{i18n.t('common.cancel')}
				</button>
				<button
					onclick={handleUpdateProfile}
					disabled={saving}
					class="border-outline/30 font-headline text-primary hover:bg-primary rounded-lg border px-4 py-2 text-sm font-bold transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
				>
					{saving ? i18n.t('account.updating') : i18n.t('userProfile.save')}
				</button>
			{:else}
				<button
					onclick={() => {
						name = user.name;
						email = user.email;
						phoneNumber = user.phoneNumber;
						birthday = user.birthday;
						gender = user.gender;
						editing = true;
					}}
					class="border-outline/30 font-headline text-primary hover:bg-primary rounded-lg border px-4 py-2 text-sm font-bold transition hover:text-white"
				>
					{i18n.t('userProfile.editProfile')}
				</button>
			{/if}
		</div>
	{:else}
		<p class="font-body text-secondary text-sm">{i18n.t('account.profileNotAvailable')}</p>
		<p class="font-body text-secondary/60 mt-1 text-xs">{i18n.t('account.logoutBackIn')}</p>
	{/if}

	<ConfirmationModal
		bind:show={showConfirm}
		title={i18n.t('account.deleteAccount')}
		message={i18n.t('account.deleteConfirm')}
		confirmText={deleting ? i18n.t('account.deleteDeleting') : i18n.t('account.deleteYes')}
		onConfirm={handleDeleteAccount}
	/>
</div>
