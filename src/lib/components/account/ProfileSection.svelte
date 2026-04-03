<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { deleteMyAccount } from '$lib/api/users';
	import { goto } from '$app/navigation';
	import { i18n } from '$lib/stores/i18n.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import { resolve } from '$app/paths';

	let deleting = $state(false);
	let error = $state('');
	let showConfirm = $state(false);

	const user = $derived(authStore.user);
	const genderLabel = $derived(
		user?.gender === 0 ? i18n.t('account.male') : i18n.t('account.female')
	);
	const roleLabel = $derived(
		user?.role === 'ROLE_ADMIN' ? i18n.t('account.admin') : i18n.t('account.user')
	);

	async function handleDeleteAccount() {
		if (!user) return;
		deleting = true;
		error = '';
		try {
			await deleteMyAccount(user.id);
			authStore.clear();
			await goto(resolve('/login'));
		} catch {
			error = i18n.t('account.errorDelete');
			deleting = false;
			showConfirm = false;
		}
	}
</script>

<div
	class="bg-surface-container-lowest border-outline-variant/15 rounded-xl border p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)]"
>
	<div class="mb-5 flex items-center gap-3">
		<div class="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
			<span class="material-symbols-outlined text-primary-container">badge</span>
		</div>
		<h2 class="font-headline text-primary text-xl font-bold">{i18n.t('account.profileTitle')}</h2>
	</div>

	{#if user}
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
