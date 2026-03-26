<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import { i18n } from '$lib/stores/i18n.svelte';
  import type { LoginResponse } from '$lib/types/user';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let remember = $state(false);
  let error = $state('');

  async function handleLogin(event: Event) {
    event.preventDefault();
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password
      })
    });
    if (res.ok) {
      const contentType = res.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/json')) {
        const body: LoginResponse = await res.json();
        authStore.setUser(body.user);
      } else {
        authStore.setEmail(email);
      }
      goto('/dashboard');
    } else {
      error = i18n.t('auth.invalidCredentials');
    }
  }

  async function handleGoogleLogin(event: Event) {
    event.preventDefault();
    const res = await fetch('http://localhost:8080/oauth2/authorization/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    if (!res.ok) {
      error = i18n.t('auth.googleFailed');
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
        <p class="font-label text-[0.6875rem] font-bold tracking-[0.3em] text-primary uppercase">{i18n.t('auth.loginTitle')}</p>
        <div class="h-px w-8 bg-primary/30"></div>
      </div>
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

      <!-- Form -->
      <form onsubmit={handleLogin} class="space-y-5">
        <!-- Email -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="email" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('auth.emailLabel')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">mail</span>
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              autocomplete="email"
              placeholder={i18n.t('auth.emailLabel')}
              class="bg-transparent border-none p-0 w-full focus:ring-0 text-base font-bold placeholder:text-outline-variant/60 text-on-surface"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="flex flex-col px-4 py-3 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
          <label for="password" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">
            {i18n.t('auth.passwordLabel')}
          </label>
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/70">lock</span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              required
              autocomplete="current-password"
              placeholder={i18n.t('auth.passwordLabel')}
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
        </div>

        <!-- Remember me / Forgot password -->
        <div class="flex items-center justify-between text-sm px-1">
          <label class="flex items-center gap-2 text-secondary cursor-pointer">
            <input
              type="checkbox"
              bind:checked={remember}
              class="form-checkbox h-4 w-4 rounded border-outline-variant text-primary-container focus:ring-primary"
            />
            <span class="font-body text-sm">{i18n.t('auth.rememberMe')}</span>
          </label>
          <a href="/login" class="font-body text-sm text-primary-container hover:text-primary transition-colors">{i18n.t('auth.forgotPassword')}</a>
        </div>

        <!-- Google Login -->
        <button
          type="button"
          onclick={handleGoogleLogin}
          class="flex w-full items-center justify-center gap-3 rounded-lg bg-surface-container-low px-4 py-3 font-headline font-bold text-sm text-on-surface transition hover:bg-surface-container"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            class="h-5 w-5"
          />
          {i18n.t('auth.signInWithGoogle')}
        </button>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full rounded-lg bg-primary-container px-8 py-4 font-headline font-bold text-lg text-white transition hover:bg-primary flex items-center justify-center gap-3 group"
        >
          {i18n.t('auth.signIn')}
          <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </form>

      <p class="mt-6 text-center font-body text-sm text-secondary">
        {i18n.t('auth.noAccount')}
        <a href="/register" class="font-bold text-primary-container hover:text-primary transition-colors">{i18n.t('auth.signUpHere')}</a>
      </p>
    </div>
  </div>
</div>
