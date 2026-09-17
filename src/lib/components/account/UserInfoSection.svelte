<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { changePassword } from '$lib/api/users';
	import { i18n } from '$lib/stores/i18n.svelte';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let saving = $state(false);
	let successMsg = $state('');
	let errorMsg = $state('');

	const knownEmail = $derived(authStore.email);
	const isGoogle = $derived(authStore.user?.provider === 'GOOGLE');

	async function handleChangePassword(e: Event) {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			errorMsg = i18n.t('account.passwordMismatch');
			return;
		}
		if (newPassword.length < 6) {
			errorMsg = i18n.t('account.passwordLength');
			return;
		}

		saving = true;
		errorMsg = '';
		successMsg = '';

		try {
			await changePassword(knownEmail, newPassword);
			successMsg = i18n.t('account.passwordSuccess');
			newPassword = '';
			confirmPassword = '';
		} catch {
			errorMsg = i18n.t('account.passwordError');
		} finally {
			saving = false;
		}
	}
</script>

<div class="border-heritage rounded-lg border bg-white p-6 shadow-md">
	<div class="mb-5 flex items-center gap-3">
		<div class="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
			<span class="material-symbols-outlined text-primary-container">lock</span>
		</div>
		<h2 class="font-headline text-primary text-xl font-bold">{i18n.t('account.changePassword')}</h2>
	</div>

	{#if isGoogle}
		<p class="font-body text-secondary text-sm">{i18n.t('account.googleAccountWarning')}</p>
	{:else}
		<form onsubmit={handleChangePassword} class="space-y-4">
			{#if knownEmail}
				<p class="font-body text-secondary text-sm">
					{i18n.t('account.changingPasswordFor')}
					<span class="text-on-surface font-bold">{knownEmail}</span>
				</p>
			{:else}
				<div
					class="bg-tertiary-fixed/30 border-tertiary-fixed flex items-center gap-3 rounded-lg border px-4 py-3"
				>
					<span class="material-symbols-outlined text-tertiary">warning</span>
					<p class="font-body text-tertiary text-sm">{i18n.t('account.prefillWarning')}</p>
				</div>
			{/if}

			<div
				class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
			>
				<label
					for="new-password"
					class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
				>
					{i18n.t('account.newPassword')}
				</label>
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-primary/70">lock_open</span>
					<input
						id="new-password"
						type="password"
						bind:value={newPassword}
						required
						autocomplete="new-password"
						placeholder={i18n.t('account.newPassword')}
						class="placeholder:text-outline-variant/60 text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
					/>
				</div>
			</div>

			<div
				class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
			>
				<label
					for="confirm-password"
					class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
				>
					{i18n.t('account.confirmNewPassword')}
				</label>
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-primary/70">lock_reset</span>
					<input
						id="confirm-password"
						type="password"
						bind:value={confirmPassword}
						required
						autocomplete="new-password"
						placeholder={i18n.t('account.confirmNewPassword')}
						class="placeholder:text-outline-variant/60 text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
					/>
				</div>
			</div>

			{#if errorMsg}
				<div class="bg-error/5 border-error/10 flex items-center gap-3 rounded-lg border px-4 py-3">
					<span class="material-symbols-outlined text-error text-sm">error</span>
					<p class="font-body text-error text-sm">{errorMsg}</p>
				</div>
			{/if}
			{#if successMsg}
				<div
					class="bg-primary/5 border-primary/10 flex items-center gap-3 rounded-lg border px-4 py-3"
				>
					<span class="material-symbols-outlined text-primary-container text-sm">check_circle</span>
					<p class="font-body text-primary text-sm">{successMsg}</p>
				</div>
			{/if}

			<button
				type="submit"
				disabled={saving || !knownEmail}
				class="bg-primary-container font-headline hover:bg-primary rounded-lg px-6 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
			>
				{saving ? i18n.t('account.updating') : i18n.t('account.updatePassword')}
			</button>
		</form>
	{/if}
</div>
