<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import ProfileSection from '$lib/components/account/ProfileSection.svelte';
	import UserInfoSection from '$lib/components/account/UserInfoSection.svelte';
	import CarsSection from '$lib/components/account/CarsSection.svelte';
	import ReviewsSection from '$lib/components/account/ReviewsSection.svelte';
	import { adminDeleteUser, updateUserRole, getUsers, getUserById } from '$lib/api/users';
	import type { UserCar, UserProfile, UserResponseDto, UserReview } from '$lib/types/user';

	const isAdmin = $derived(authStore.isAdmin);

	let profile = $state<UserProfile | null>(null);
	let profileError = $state('');

	let allUsers = $state<UserResponseDto[]>([]);
	let roleUpdating = $state<number | null>(null);
	let deleting = $state<number | null>(null);
	let adminError = $state('');

	$effect(() => {
		const id = authStore.user?.id;
		if (id) {
			getUserById(id)
				.then((p) => (profile = p))
				.catch(() => (profileError = 'Failed to load profile.'));
		}
	});

	$effect(() => {
		if (isAdmin) {
			getUsers()
				.then((users: UserResponseDto[]) => (allUsers = users))
				.catch(() => (adminError = 'Failed to load users.'));
		}
	});

	const cars = $derived<UserCar[]>(profile?.cars ?? []);
	const reviews = $derived<UserReview[]>(profile?.reviews ?? []);

	async function handleRoleToggle(user: UserResponseDto) {
		roleUpdating = user.id;
		adminError = '';
		const newRole = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
		try {
			const updated = await updateUserRole(user.id, newRole);
			allUsers = allUsers.map((u) => (u.id === updated.id ? updated : u));
		} catch {
			adminError = `Failed to update role for user #${user.id}.`;
		} finally {
			roleUpdating = null;
		}
	}

	async function handleAdminDelete(id: number) {
		deleting = id;
		adminError = '';
		try {
			await adminDeleteUser(id);
			allUsers = allUsers.filter((u) => u.id !== id);
		} catch {
			adminError = `Failed to delete user #${id}.`;
		} finally {
			deleting = null;
		}
	}
</script>

<div class="space-y-8">
	<h1 class="text-2xl font-bold text-white">My Account</h1>

	<!-- User not loaded warning -->
	{#if !authStore.user}
		<div class="rounded-xl bg-yellow-900/30 border border-yellow-600 p-4 text-sm text-yellow-300">
			<strong>Your profile data is not loaded.</strong> Please
			<a href="/login" class="underline hover:text-yellow-100">log out and log in again</a>
			to refresh your session.
		</div>
	{/if}

	<!-- Own profile -->
	<div class="grid gap-6 lg:grid-cols-2">
		<ProfileSection />
		<UserInfoSection />
	</div>

	{#if profileError}
		<p class="rounded border border-red-500 bg-red-900/30 p-2 text-sm text-red-400">{profileError}</p>
	{/if}

	<div class="grid gap-6 lg:grid-cols-2">
		<CarsSection {cars} />
		<ReviewsSection {reviews} />
	</div>

	<!-- Admin panel -->
	{#if isAdmin}
		<section>
			<h2 class="mb-4 text-xl font-semibold text-white">Admin — All Users</h2>

			{#if adminError}
				<p class="mb-3 rounded border border-red-500 bg-red-900/30 p-2 text-sm text-red-400">
					{adminError}
				</p>
			{/if}

			{#if allUsers.length === 0}
				<p class="text-sm text-slate-400">No users found.</p>
			{:else}
				<div class="overflow-x-auto rounded-xl bg-slate-800 shadow">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b border-slate-700 text-left text-slate-400">
								<th class="px-4 py-3">ID</th>
								<th class="px-4 py-3">Name</th>
								<th class="px-4 py-3">Email</th>
								<th class="px-4 py-3">Role</th>
								<th class="px-4 py-3">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each allUsers as user (user.id)}
								<tr class="border-b border-slate-700/50 transition hover:bg-slate-700/30">
									<td class="px-4 py-3 text-slate-400">{user.id}</td>
									<td class="px-4 py-3 text-white">{user.name}</td>
									<td class="px-4 py-3 text-slate-300">{user.email}</td>
									<td class="px-4 py-3">
										<span
											class={[
												'rounded-full px-2 py-0.5 text-xs font-medium',
												user.role === 'ROLE_ADMIN'
													? 'bg-blue-900 text-blue-300'
													: 'bg-slate-700 text-slate-300'
											].join(' ')}
										>
											{user.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
										</span>
									</td>
									<td class="flex gap-2 px-4 py-3">
										<a
											href={`/users/${user.id}`}
											class="rounded bg-slate-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-500"
										>
											View
										</a>
										<button
											onclick={() => handleRoleToggle(user)}
											disabled={roleUpdating === user.id}
											class="rounded bg-blue-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
										>
											{roleUpdating === user.id
												? '…'
												: user.role === 'ROLE_ADMIN'
													? 'Demote'
													: 'Promote'}
										</button>
										<button
											onclick={() => handleAdminDelete(user.id)}
											disabled={deleting === user.id}
											class="rounded bg-red-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
										>
											{deleting === user.id ? '…' : 'Delete'}
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	{/if}
</div>
