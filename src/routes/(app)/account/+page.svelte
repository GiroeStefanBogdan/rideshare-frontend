<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import ProfileSection from '$lib/components/account/ProfileSection.svelte';
	import UserInfoSection from '$lib/components/account/UserInfoSection.svelte';
	import CarsSection from '$lib/components/account/CarsSection.svelte';
	import ReviewsSection from '$lib/components/account/ReviewsSection.svelte';
	import { adminDeleteUser, updateUserRole, getUsers, getUserCars } from '$lib/api/users';
	import type { UserCar, UserProfile, UserResponseDto, UserReview } from '$lib/types/user';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { resolve } from '$app/paths';

	const isAdmin = $derived(authStore.isAdmin);

	let profile = $state<UserProfile | null>(null);
	let profileError = $state('');

	let allUsers = $state<UserResponseDto[]>([]);
	let roleUpdating = $state<number | null>(null);
	let deleting = $state<number | null>(null);
	let adminError = $state('');

	$effect(() => {
		if (authStore.user) {
			getUserCars()
				.then((userCars) => {
					cars = userCars;
				})
				.catch(() => {
					profileError = i18n.t('account.failedLoadUsers');
				});
		}
	});

	$effect(() => {
		if (authStore.user) {
			profile = authStore.user as UserProfile;
		}
	});

	$effect(() => {
		if (isAdmin) {
			getUsers()
				.then((users: UserResponseDto[]) => (allUsers = users))
				.catch(() => (adminError = i18n.t('account.failedLoadUsers')));
		}
	});

	const reviews = $derived<UserReview[]>(profile?.reviews ?? []);

	let cars = $state<UserCar[]>([]);

	async function handleRoleToggle(user: UserResponseDto) {
		roleUpdating = user.id;
		adminError = '';
		const newRole = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
		try {
			const updated = await updateUserRole(user.id, newRole);
			allUsers = allUsers.map((u) => (u.id === updated.id ? updated : u));
		} catch {
			adminError = `${i18n.t('account.failedUpdateRole')}${user.id}.`;
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
			adminError = `${i18n.t('account.failedDeleteUser')}${id}.`;
		} finally {
			deleting = null;
		}
	}
</script>

<!-- Page header -->
<section class="folk-pattern-bg border-primary/5 relative overflow-hidden border-b pt-16 pb-12">
	<div class="relative z-10 mx-auto max-w-7xl px-8">
		<div class="mb-3 inline-flex items-center gap-2">
			<div class="bg-primary/30 h-px w-8"></div>
			<p class="font-label text-primary text-[0.6875rem] font-bold tracking-[0.3em] uppercase">
				{i18n.t('account.title')}
			</p>
		</div>
		<h1 class="font-headline text-primary text-4xl leading-tight font-extrabold tracking-tight">
			{authStore.user?.name ?? i18n.t('account.title')}
		</h1>
	</div>
</section>

<div class="ia-divider w-full opacity-60"></div>

<div class="mx-auto max-w-7xl space-y-10 px-8 py-12">
	<!-- User not loaded warning -->
	{#if !authStore.user}
		<div
			class="bg-tertiary-fixed/30 border-tertiary-fixed flex items-center gap-3 rounded-lg border px-4 py-3"
		>
			<span class="material-symbols-outlined text-tertiary">warning</span>
			<p class="font-body text-tertiary text-sm">
				<strong>{i18n.t('account.notLoadedWarning')}</strong>
				{i18n.t('account.refreshSession')}
				<a
					href={resolve('/login')}
					class="text-primary-container hover:text-primary font-bold underline transition-colors"
					>{i18n.t('hero.loginLink')}</a
				>
			</p>
		</div>
	{/if}

	<!-- Own profile -->
	<div class="grid gap-6 lg:grid-cols-2">
		<ProfileSection />
		<UserInfoSection />
	</div>

	{#if profileError}
		<div class="bg-error/5 border-error/10 flex items-center gap-3 rounded-lg border px-4 py-3">
			<span class="material-symbols-outlined text-error">error</span>
			<p class="font-body text-error text-sm">{profileError}</p>
		</div>
	{/if}

	<div class="grid gap-6 lg:grid-cols-2">
		<CarsSection bind:cars editable />
		<ReviewsSection {reviews} />
	</div>

	<!-- Admin panel -->
	{#if isAdmin}
		<section>
			<div class="mb-6 inline-flex items-center gap-2">
				<div class="bg-primary/30 h-px w-8"></div>
				<p class="font-label text-primary text-[0.6875rem] font-bold tracking-[0.3em] uppercase">
					{i18n.t('account.adminPanelTitle')}
				</p>
			</div>

			{#if adminError}
				<div
					class="bg-error/5 border-error/10 mb-4 flex items-center gap-3 rounded-lg border px-4 py-3"
				>
					<span class="material-symbols-outlined text-error">error</span>
					<p class="font-body text-error text-sm">{adminError}</p>
				</div>
			{/if}

			{#if allUsers.length === 0}
				<p class="font-body text-secondary text-sm">{i18n.t('account.noUsersFound')}</p>
			{:else}
				<div class="border-heritage overflow-x-auto rounded-lg border bg-white shadow-md">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-outline-variant/15 border-b text-left">
								<th
									class="font-label text-secondary/70 px-4 py-3 text-[0.6875rem] font-bold tracking-widest uppercase"
									>ID</th
								>
								<th
									class="font-label text-secondary/70 px-4 py-3 text-[0.6875rem] font-bold tracking-widest uppercase"
									>{i18n.t('account.name')}</th
								>
								<th
									class="font-label text-secondary/70 px-4 py-3 text-[0.6875rem] font-bold tracking-widest uppercase"
									>{i18n.t('account.email')}</th
								>
								<th
									class="font-label text-secondary/70 px-4 py-3 text-[0.6875rem] font-bold tracking-widest uppercase"
									>{i18n.t('account.role')}</th
								>
								<th
									class="font-label text-secondary/70 px-4 py-3 text-[0.6875rem] font-bold tracking-widest uppercase"
									>{i18n.t('account.actions')}</th
								>
							</tr>
						</thead>
						<tbody>
							{#each allUsers as user (user.id)}
								<tr
									class="border-outline-variant/10 hover:bg-surface-container-low border-b transition last:border-0"
								>
									<td class="font-body text-secondary px-4 py-3">{user.id}</td>
									<td class="font-headline text-on-surface px-4 py-3 font-bold">{user.name}</td>
									<td class="font-body text-secondary px-4 py-3">{user.email}</td>
									<td class="px-4 py-3">
										<span
											class={[
												'font-label rounded-full px-3 py-1 text-[0.6875rem] font-bold tracking-widest uppercase',
												user.role === 'ROLE_ADMIN'
													? 'bg-primary/10 text-primary'
													: 'bg-surface-container text-secondary'
											].join(' ')}
										>
											{user.role === 'ROLE_ADMIN'
												? i18n.t('account.admin')
												: i18n.t('account.user')}
										</span>
									</td>
									<td class="flex gap-2 px-4 py-3">
										<a
											href={resolve(`/users/${user.id}`)}
											class="bg-surface-container font-headline text-on-surface hover:bg-surface-container-high rounded-lg px-3 py-1.5 text-xs font-bold transition"
										>
											{i18n.t('account.view')}
										</a>
										<button
											onclick={() => handleRoleToggle(user)}
											disabled={roleUpdating === user.id}
											class="bg-primary/10 font-headline text-primary hover:bg-primary rounded-lg px-3 py-1.5 text-xs font-bold transition hover:text-white disabled:opacity-50"
										>
											{roleUpdating === user.id
												? '…'
												: user.role === 'ROLE_ADMIN'
													? i18n.t('account.demote')
													: i18n.t('account.promote')}
										</button>
										<button
											onclick={() => handleAdminDelete(user.id)}
											disabled={deleting === user.id}
											class="bg-error/10 font-headline text-error hover:bg-error rounded-lg px-3 py-1.5 text-xs font-bold transition hover:text-white disabled:opacity-50"
										>
											{deleting === user.id ? '…' : i18n.t('account.delete')}
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
