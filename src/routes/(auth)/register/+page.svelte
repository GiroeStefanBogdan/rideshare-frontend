<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import type { UserResponseDto } from '$lib/types/user';
  import { i18n } from '$lib/stores/i18n.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let birthday = $state('');
  let phoneNumber = $state('');
  let gender = $state('');
  let confirm = $state('');
  let newsletter = $state(true);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let error = $state('');
  let fieldErrors: Record<string, string> = $state({});

  let passwordsMatch = $derived(password === confirm);

  async function handleRegister(event: Event) {
    event.preventDefault();

    if (!error) {
      const res = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          birthday,
          phoneNumber,
          gender
        })
      });

      if (res.ok) {
        const user: UserResponseDto = await res.json();
        authStore.setUser(user);
        goto('/login');
      } else {
        if (res.headers.get('Content-Type')?.includes('application/json')) {
          const data = await res.json();
          if (typeof data === 'object') {
            fieldErrors = data;
          }
        }
        error = i18n.t('register.errorDefault');
      }
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center folk-pattern-bg px-4 py-16">
  <div class="w-full max-w-md">
    <!-- Brand mark -->
    <div class="mb-10 text-center">
      <a href="/" class="font-headline text-3xl font-black tracking-tight text-primary">DrumBun</a>
      <div class="mt-3 inline-flex items-center gap-2">
        <div class="h-px w-8 bg-primary/30"></div>
        <p class="font-label text-[0.6875rem] font-bold tracking-[0.3em] text-primary uppercase">{i18n.t('register.title')}</p>
        <div class="h-px w-8 bg-primary/30"></div>
      </div>
      <p class="mt-2 font-body text-sm text-secondary">{i18n.t('register.subtitle')}</p>
    </div>

    <!-- Card -->
    <div class="glass-panel rounded-xl shadow-[0_40px_100px_rgba(0,32,104,0.08)] p-8 border border-outline-variant/20 ia-border-accent">

      <!-- Error -->
      {#if error}
        <div class="mb-6 flex items-center gap-3 rounded-lg bg-error/5 px-4 py-3 border border-error/10">
          <span class="material-symbols-outlined text-error">error</span>
          <p class="text-sm font-medium text-error">{error}</p>
        </div>
      {/if}

      <form onsubmit={handleRegister} class="space-y-4">
        <!-- Full Name -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="name" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('register.fullName')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">person</span>
            <input
              id="name"
              type="text"
              bind:value={name}
              required
              class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold placeholder:text-outline-variant/60 text-on-surface"
            />
          </div>
        </div>

        <!-- Email -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="email" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('register.email')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">mail</span>
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              autocomplete="email"
              class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold placeholder:text-outline-variant/60 text-on-surface"
            />
          </div>
          {#if fieldErrors.email}
            <p class="mt-1 text-xs text-error">{fieldErrors.email}</p>
          {/if}
        </div>

        <!-- Gender -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="gender" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('register.gender')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">wc</span>
            <select
              id="gender"
              bind:value={gender}
              required
              class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold text-on-surface"
            >
              <option value="MALE">{i18n.t('account.male')}</option>
              <option value="FEMALE">{i18n.t('account.female')}</option>
            </select>
          </div>
        </div>

        <!-- Birthday -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="birthday" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('register.birthday')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">cake</span>
            <input
              id="birthday"
              type="date"
              bind:value={birthday}
              required
              class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold text-on-surface appearance-none"
            />
          </div>
          {#if fieldErrors.birthday}
            <p class="mt-1 text-xs text-error">{fieldErrors.birthday}</p>
          {/if}
        </div>

        <!-- Phone -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="phoneNumber" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('register.phone')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">phone</span>
            <input
              id="phoneNumber"
              type="tel"
              bind:value={phoneNumber}
              required
              class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold placeholder:text-outline-variant/60 text-on-surface"
            />
          </div>
          {#if fieldErrors.phoneNumber}
            <p class="mt-1 text-xs text-error">{fieldErrors.phoneNumber}</p>
          {/if}
        </div>

        <!-- Password -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="password" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('register.password')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">lock</span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              required
              class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold placeholder:text-outline-variant/60 text-on-surface"
            />
            <button
              type="button"
              class="font-label text-[0.6875rem] font-bold tracking-widest text-primary/70 uppercase hover:text-primary transition-colors"
              onclick={() => (showPassword = !showPassword)}
              aria-label={showPassword ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')}
            >
              {showPassword ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')}
            </button>
          </div>
          {#if fieldErrors.password}
            <p class="mt-1 text-xs text-error">{fieldErrors.password}</p>
          {/if}
        </div>

        <!-- Confirm Password -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="confirm" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('register.confirmPassword')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">lock_reset</span>
            <input
              id="confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              bind:value={confirm}
              required
              class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold placeholder:text-outline-variant/60 text-on-surface"
            />
            <button
              type="button"
              class="font-label text-[0.6875rem] font-bold tracking-widest text-primary/70 uppercase hover:text-primary transition-colors"
              onclick={() => (showConfirmPassword = !showConfirmPassword)}
              aria-label={showConfirmPassword ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')}
            >
              {showConfirmPassword ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')}
            </button>
          </div>
          {#if !passwordsMatch && confirm}
            <p class="mt-1 text-xs text-error">{i18n.t('register.passwordsDoNotMatch')}</p>
          {/if}
        </div>

        <!-- Newsletter -->
        <label class="flex items-center gap-3 px-1 cursor-pointer">
          <input
            id="newsletter"
            type="checkbox"
            bind:checked={newsletter}
            class="form-checkbox h-4 w-4 rounded border-outline-variant text-primary-container focus:ring-primary"
          />
          <span class="font-body text-sm text-secondary">{i18n.t('register.newsletter')}</span>
        </label>

        <!-- Submit -->
        <button
          type="submit"
          disabled={!passwordsMatch}
          class="w-full rounded-lg bg-primary-container px-8 py-4 font-headline font-bold text-lg text-white transition hover:bg-primary flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {i18n.t('register.createButton')}
          <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </form>

      <p class="mt-6 text-center font-body text-sm text-secondary">
        {i18n.t('register.alreadyHaveAccount')}
        <a href="/login" class="font-bold text-primary-container hover:text-primary transition-colors">{i18n.t('register.loginHere')}</a>
      </p>
    </div>
  </div>
</div>
