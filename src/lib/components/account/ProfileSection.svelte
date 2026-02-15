<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { deleteMyAccount } from '$lib/api/users';
	import { goto } from '$app/navigation';

	let deleting = $state(false);
	let error = $state('');
	let showConfirm = $state(false);

	const user = $derived(authStore.user);
	const genderLabel = $derived(user?.gender === 0 ? 'Male' : 'Female');
	const roleLabel = $derived(user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User');

	async function handleDeleteAccount() {
		if (!user) return;
		deleting = true;
		error = '';
		try {
			await deleteMyAccount(user.id);
			authStore.clear();
			goto('/login');
		} catch {
			error = 'Failed to delete account. Please try again.';
			deleting = false;
			showConfirm = false;
		}
	}
</script>

<div class="rounded-xl bg-slate-800 p-6 shadow">
	<h2 class="mb-4 text-xl font-semibold text-white">Profile</h2>

	{#if user}
		<dl class="space-y-3 text-sm">
			<div class="flex justify-between">
				<dt class="text-slate-400">Name</dt>
				<dd class="font-medium text-white">{user.name}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-slate-400">Email</dt>
				<dd class="font-medium text-white">{user.email}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-slate-400">Birthday</dt>
				<dd class="font-medium text-white">{user.birthday}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-slate-400">Gender</dt>
				<dd class="font-medium text-white">{genderLabel}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-slate-400">Phone</dt>
				<dd class="font-medium text-white">{user.phoneNumber}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-slate-400">Role</dt>
				<dd class="font-medium text-white">{roleLabel}</dd>
			</div>
			<div class="flex justify-between">
				<dt class="text-slate-400">Provider</dt>
				<dd class="font-medium text-white">{user.provider}</dd>
			</div>
		</dl>

		<div class="mt-6 border-t border-slate-700 pt-4">
			{#if error}
				<p class="mb-3 rounded border border-red-500 bg-red-900/30 p-2 text-sm text-red-400">
					{error}
				</p>
			{/if}

			{#if showConfirm}
				<p class="mb-3 text-sm text-slate-300">
					Are you sure? This action is <strong class="text-red-400">irreversible</strong>.
				</p>
				<div class="flex gap-3">
					<button
						onclick={handleDeleteAccount}
						disabled={deleting}
						class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
					>
						{deleting ? 'Deleting…' : 'Yes, delete my account'}
					</button>
					<button
						onclick={() => (showConfirm = false)}
						disabled={deleting}
						class="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-400 disabled:opacity-50"
					>
						Cancel
					</button>
				</div>
			{:else}
				<button
					onclick={() => (showConfirm = true)}
					class="rounded-lg border border-red-600 px-4 py-2 text-sm text-red-400 transition hover:bg-red-600 hover:text-white"
				>
					Delete account
				</button>
			{/if}
		</div>
	{:else}
		<p class="mb-3 text-sm text-slate-400">Profile data not available.</p>
		<p class="text-xs text-slate-500">
			Log out and log back in after registering to manage your account.
		</p>
	{/if}
</div>
