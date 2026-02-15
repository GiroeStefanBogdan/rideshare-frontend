<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { changePassword } from '$lib/api/users';

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
			errorMsg = 'Passwords do not match.';
			return;
		}
		if (newPassword.length < 6) {
			errorMsg = 'New password must be at least 6 characters.';
			return;
		}

		saving = true;
		errorMsg = '';
		successMsg = '';

		try {
			await changePassword(knownEmail, newPassword);
			successMsg = 'Password changed successfully.';
			newPassword = '';
			confirmPassword = '';
		} catch {
			errorMsg = 'Failed to change password. Please try again.';
		} finally {
			saving = false;
		}
	}
</script>

<div class="rounded-xl bg-slate-800 p-6 shadow">
	<h2 class="mb-4 text-xl font-semibold text-white">Change Password</h2>

	{#if isGoogle}
		<p class="text-sm text-slate-400">
			Password change is not available for Google-linked accounts.
		</p>
	{:else}
		<form onsubmit={handleChangePassword} class="space-y-4">
			{#if knownEmail}
				<p class="text-sm text-slate-400">
					Changing password for <span class="font-medium text-slate-200">{knownEmail}</span>
				</p>
			{:else}
				<p class="rounded border border-yellow-600 bg-yellow-900/20 p-2 text-sm text-yellow-400">
					Log out and log in again to pre-fill your email.
				</p>
			{/if}

			<div>
				<label for="new-password" class="mb-1 block text-sm font-medium text-slate-300">
					New password
				</label>
				<input
					id="new-password"
					type="password"
					bind:value={newPassword}
					required
					autocomplete="new-password"
					class="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					placeholder="New password"
				/>
			</div>

			<div>
				<label for="confirm-password" class="mb-1 block text-sm font-medium text-slate-300">
					Confirm new password
				</label>
				<input
					id="confirm-password"
					type="password"
					bind:value={confirmPassword}
					required
					autocomplete="new-password"
					class="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					placeholder="Confirm new password"
				/>
			</div>

			{#if errorMsg}
				<p class="rounded border border-red-500 bg-red-900/30 p-2 text-sm text-red-400">
					{errorMsg}
				</p>
			{/if}
			{#if successMsg}
				<p class="rounded border border-green-500 bg-green-900/30 p-2 text-sm text-green-400">
					{successMsg}
				</p>
			{/if}

			<button
				type="submit"
				disabled={saving || !knownEmail}
				class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
			>
				{saving ? 'Saving…' : 'Update password'}
			</button>
		</form>
	{/if}
</div>
