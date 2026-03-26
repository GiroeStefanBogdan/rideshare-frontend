<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import ProfileSection from '$lib/components/account/ProfileSection.svelte';
  import UserInfoSection from '$lib/components/account/UserInfoSection.svelte';
  import CarsSection from '$lib/components/account/CarsSection.svelte';
  import ReviewsSection from '$lib/components/account/ReviewsSection.svelte';
  import { adminDeleteUser, updateUserRole, getUsers, getUserById } from '$lib/api/users';
  import type { UserCar, UserProfile, UserResponseDto, UserReview } from '$lib/types/user';
  import { i18n } from '$lib/stores/i18n.svelte';

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
        .catch(() => (profileError = i18n.t('account.failedLoadUsers')));
    }
  });

  $effect(() => {
    if (isAdmin) {
      getUsers()
        .then((users: UserResponseDto[]) => (allUsers = users))
        .catch(() => (adminError = i18n.t('account.failedLoadUsers')));
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
<section class="relative pt-16 pb-12 folk-pattern-bg overflow-hidden border-b border-primary/5">
  <div class="max-w-7xl mx-auto px-8 relative z-10">
    <div class="inline-flex items-center gap-2 mb-3">
      <div class="h-px w-8 bg-primary/30"></div>
      <p class="font-label text-[0.6875rem] font-bold tracking-[0.3em] text-primary uppercase">{i18n.t('account.title')}</p>
    </div>
    <h1 class="font-headline text-4xl font-extrabold text-primary leading-tight tracking-tight">
      {authStore.user?.name ?? i18n.t('account.title')}
    </h1>
  </div>
</section>

<div class="ia-divider w-full opacity-60"></div>

<div class="max-w-7xl mx-auto px-8 py-12 space-y-10">

  <!-- User not loaded warning -->
  {#if !authStore.user}
    <div class="flex items-center gap-3 rounded-lg bg-tertiary-fixed/30 px-4 py-3 border border-tertiary-fixed">
      <span class="material-symbols-outlined text-tertiary">warning</span>
      <p class="font-body text-sm text-tertiary">
        <strong>{i18n.t('account.notLoadedWarning')}</strong> {i18n.t('account.refreshSession')}
        <a href="/login" class="font-bold text-primary-container hover:text-primary transition-colors underline">{i18n.t('hero.loginLink')}</a>
      </p>
    </div>
  {/if}

  <!-- Own profile -->
  <div class="grid gap-6 lg:grid-cols-2">
    <ProfileSection />
    <UserInfoSection />
  </div>

  {#if profileError}
    <div class="flex items-center gap-3 rounded-lg bg-error/5 px-4 py-3 border border-error/10">
      <span class="material-symbols-outlined text-error">error</span>
      <p class="font-body text-sm text-error">{profileError}</p>
    </div>
  {/if}

  <div class="grid gap-6 lg:grid-cols-2">
    <CarsSection {cars} />
    <ReviewsSection {reviews} />
  </div>

  <!-- Admin panel -->
  {#if isAdmin}
    <section>
      <div class="mb-6 inline-flex items-center gap-2">
        <div class="h-px w-8 bg-primary/30"></div>
        <p class="font-label text-[0.6875rem] font-bold tracking-[0.3em] text-primary uppercase">{i18n.t('account.adminPanelTitle')}</p>
      </div>

      {#if adminError}
        <div class="mb-4 flex items-center gap-3 rounded-lg bg-error/5 px-4 py-3 border border-error/10">
          <span class="material-symbols-outlined text-error">error</span>
          <p class="font-body text-sm text-error">{adminError}</p>
        </div>
      {/if}

      {#if allUsers.length === 0}
        <p class="font-body text-sm text-secondary">{i18n.t('account.noUsersFound')}</p>
      {:else}
        <div class="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-[0_8px_40px_rgba(0,32,104,0.06)] border border-outline-variant/15">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-outline-variant/15 text-left">
                <th class="px-4 py-3 font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">ID</th>
                <th class="px-4 py-3 font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('account.name')}</th>
                <th class="px-4 py-3 font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('account.email')}</th>
                <th class="px-4 py-3 font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('account.role')}</th>
                <th class="px-4 py-3 font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('account.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {#each allUsers as user (user.id)}
                <tr class="border-b border-outline-variant/10 transition hover:bg-surface-container-low last:border-0">
                  <td class="px-4 py-3 font-body text-secondary">{user.id}</td>
                  <td class="px-4 py-3 font-headline font-bold text-on-surface">{user.name}</td>
                  <td class="px-4 py-3 font-body text-secondary">{user.email}</td>
                  <td class="px-4 py-3">
                    <span class={[
                      'rounded-full px-3 py-1 font-label text-[0.6875rem] font-bold tracking-widest uppercase',
                      user.role === 'ROLE_ADMIN'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-container text-secondary'
                    ].join(' ')}>
                      {user.role === 'ROLE_ADMIN' ? i18n.t('account.admin') : i18n.t('account.user')}
                    </span>
                  </td>
                  <td class="flex gap-2 px-4 py-3">
                    <a
                      href={`/users/${user.id}`}
                      class="rounded-lg bg-surface-container px-3 py-1.5 font-headline text-xs font-bold text-on-surface transition hover:bg-surface-container-high"
                    >
                      {i18n.t('account.view')}
                    </a>
                    <button
                      onclick={() => handleRoleToggle(user)}
                      disabled={roleUpdating === user.id}
                      class="rounded-lg bg-primary/10 px-3 py-1.5 font-headline text-xs font-bold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
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
                      class="rounded-lg bg-error/10 px-3 py-1.5 font-headline text-xs font-bold text-error transition hover:bg-error hover:text-white disabled:opacity-50"
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
