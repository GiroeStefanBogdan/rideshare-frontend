<script lang="ts">
  import { authStore } from '$lib/stores/auth.svelte';
  import { deleteMyAccount } from '$lib/api/users';
  import { goto } from '$app/navigation';
  import { i18n } from '$lib/stores/i18n.svelte';

  let deleting = $state(false);
  let error = $state('');
  let showConfirm = $state(false);

  const user = $derived(authStore.user);
  const genderLabel = $derived(user?.gender === 0 ? i18n.t('account.male') : i18n.t('account.female'));
  const roleLabel = $derived(user?.role === 'ROLE_ADMIN' ? i18n.t('account.admin') : i18n.t('account.user'));

  async function handleDeleteAccount() {
    if (!user) return;
    deleting = true;
    error = '';
    try {
      await deleteMyAccount(user.id);
      authStore.clear();
      goto('/login');
    } catch {
      error = i18n.t('account.errorDelete');
      deleting = false;
      showConfirm = false;
    }
  }
</script>

<div class="rounded-xl bg-surface-container-lowest p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)] border border-outline-variant/15">
  <div class="mb-5 flex items-center gap-3">
    <div class="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary-container">badge</span>
    </div>
    <h2 class="font-headline text-xl font-bold text-primary">{i18n.t('account.profileTitle')}</h2>
  </div>

  {#if user}
    <dl class="space-y-3">
      {#each [
        { label: i18n.t('account.name'), value: user.name },
        { label: i18n.t('account.email'), value: user.email },
        { label: i18n.t('account.birthday'), value: user.birthday },
        { label: i18n.t('account.gender'), value: genderLabel },
        { label: i18n.t('account.phone'), value: user.phoneNumber },
        { label: i18n.t('account.role'), value: roleLabel },
        { label: i18n.t('account.provider'), value: user.provider },
      ] as row (row.label)}
        <div class="flex justify-between items-center py-2 border-b border-outline-variant/10 last:border-0">
          <dt class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{row.label}</dt>
          <dd class="font-body font-semibold text-on-surface text-sm">{row.value}</dd>
        </div>
      {/each}
    </dl>

    <div class="mt-6 pt-4 border-t border-outline-variant/10">
      {#if error}
        <div class="mb-4 flex items-center gap-3 rounded-lg bg-error/5 px-4 py-3 border border-error/10">
          <span class="material-symbols-outlined text-error text-sm">error</span>
          <p class="text-sm text-error">{error}</p>
        </div>
      {/if}

      {#if showConfirm}
        <p class="mb-4 font-body text-sm text-secondary">{i18n.t('account.deleteConfirm')}</p>
        <div class="flex gap-3">
          <button
            onclick={handleDeleteAccount}
            disabled={deleting}
            class="rounded-lg bg-error px-4 py-2 font-headline text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {deleting ? i18n.t('account.deleteDeleting') : i18n.t('account.deleteYes')}
          </button>
          <button
            onclick={() => (showConfirm = false)}
            disabled={deleting}
            class="rounded-lg bg-surface-container-high px-4 py-2 font-headline text-sm font-bold text-on-surface transition hover:bg-surface-container-highest disabled:opacity-50"
          >
            {i18n.t('account.cancel')}
          </button>
        </div>
      {:else}
        <button
          onclick={() => (showConfirm = true)}
          class="rounded-lg border border-error/30 px-4 py-2 font-headline text-sm font-bold text-error transition hover:bg-error hover:text-white"
        >
          {i18n.t('account.deleteAccount')}
        </button>
      {/if}
    </div>
  {:else}
    <p class="font-body text-sm text-secondary">{i18n.t('account.profileNotAvailable')}</p>
    <p class="mt-1 font-body text-xs text-secondary/60">{i18n.t('account.logoutBackIn')}</p>
  {/if}
</div>
