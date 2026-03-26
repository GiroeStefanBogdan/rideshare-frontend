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

<div class="rounded-xl bg-surface-container-lowest p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)] border border-outline-variant/15">
  <div class="mb-5 flex items-center gap-3">
    <div class="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary-container">lock</span>
    </div>
    <h2 class="font-headline text-xl font-bold text-primary">{i18n.t('account.changePassword')}</h2>
  </div>

  {#if isGoogle}
    <p class="font-body text-sm text-secondary">{i18n.t('account.googleAccountWarning')}</p>
  {:else}
    <form onsubmit={handleChangePassword} class="space-y-4">
      {#if knownEmail}
        <p class="font-body text-sm text-secondary">
          {i18n.t('account.changingPasswordFor')} <span class="font-bold text-on-surface">{knownEmail}</span>
        </p>
      {:else}
        <div class="flex items-center gap-3 rounded-lg bg-tertiary-fixed/30 px-4 py-3 border border-tertiary-fixed">
          <span class="material-symbols-outlined text-tertiary">warning</span>
          <p class="font-body text-sm text-tertiary">{i18n.t('account.prefillWarning')}</p>
        </div>
      {/if}

      <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
        <label for="new-password" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
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
            class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold placeholder:text-outline-variant/60 text-on-surface"
          />
        </div>
      </div>

      <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
        <label for="confirm-password" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
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
            class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold placeholder:text-outline-variant/60 text-on-surface"
          />
        </div>
      </div>

      {#if errorMsg}
        <div class="flex items-center gap-3 rounded-lg bg-error/5 px-4 py-3 border border-error/10">
          <span class="material-symbols-outlined text-error text-sm">error</span>
          <p class="font-body text-sm text-error">{errorMsg}</p>
        </div>
      {/if}
      {#if successMsg}
        <div class="flex items-center gap-3 rounded-lg bg-primary/5 px-4 py-3 border border-primary/10">
          <span class="material-symbols-outlined text-primary-container text-sm">check_circle</span>
          <p class="font-body text-sm text-primary">{successMsg}</p>
        </div>
      {/if}

      <button
        type="submit"
        disabled={saving || !knownEmail}
        class="rounded-lg bg-primary-container px-6 py-3 font-headline text-sm font-bold text-white transition hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? i18n.t('account.updating') : i18n.t('account.updatePassword')}
      </button>
    </form>
  {/if}
</div>
