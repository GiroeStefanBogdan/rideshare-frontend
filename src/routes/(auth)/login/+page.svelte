<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import { handleLogin, handleGoogleLogin, routes } from '$lib/api/auth';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let remember = $state(false);
	let error = $state('');

	async function onSubmit(event: Event) {
		event.preventDefault();
		error = '';
		await handleLogin({ email, password, rememberMe: remember }, (msg) => (error = msg));
	}
</script>

<div class="folk-pattern-bg flex min-h-screen items-center justify-center px-4 py-16">
	<div class="w-full max-w-md">
		<!-- Brand mark -->
		<div class="mb-10 text-center">
			<a href={routes.home} class="font-headline text-primary text-3xl font-black tracking-tight"
				>DrumBun</a
			>
			<div class="mt-3 inline-flex items-center gap-2">
				<div class="bg-primary/30 h-px w-8"></div>
				<p class="font-label text-primary text-[0.6875rem] font-bold tracking-[0.3em] uppercase">
					{i18n.t('auth.loginTitle')}
				</p>
				<div class="bg-primary/30 h-px w-8"></div>
			</div>
		</div>

		<!-- Card -->
		<div
			class="glass-panel border-outline-variant/20 ia-border-accent rounded-xl border p-8 shadow-[0_40px_100px_rgba(0,32,104,0.08)]"
		>
			<!-- Error -->
			{#if error}
				<div
					class="bg-error/5 border-error/10 mb-6 flex items-center gap-3 rounded-lg border px-4 py-3"
				>
					<span class="material-symbols-outlined text-error">error</span>
					<p class="text-error text-sm font-medium">{error}</p>
				</div>
			{/if}

			<!-- Form -->
			<form onsubmit={onSubmit} class="space-y-5">
				<!-- Email -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="email"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
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
							class="placeholder:text-outline-variant/60 text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
						/>
					</div>
				</div>

				<!-- Password -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="password"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
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
							class="placeholder:text-outline-variant/60 text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
						/>
						<button
							type="button"
							class="font-label text-primary/70 hover:text-primary text-[0.6875rem] font-bold tracking-widest uppercase transition-colors"
							onclick={() => (showPassword = !showPassword)}
							aria-label={showPassword ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')}
						>
							{showPassword ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')}
						</button>
					</div>
				</div>

				<!-- Remember me / Forgot password -->
				<div class="flex items-center justify-between px-1 text-sm">
					<label class="text-secondary flex cursor-pointer items-center gap-2">
						<input
							type="checkbox"
							bind:checked={remember}
							class="form-checkbox border-outline-variant text-primary-container focus:ring-primary h-4 w-4 rounded"
						/>
						<span class="font-body text-sm">{i18n.t('auth.rememberMe')}</span>
					</label>
					<a
						href={routes.forgotPassword}
						class="font-body text-primary-container hover:text-primary text-sm transition-colors"
					>
						{i18n.t('auth.forgotPassword')}
					</a>
				</div>

				<!-- Google Login -->
				<button
					type="button"
					onclick={handleGoogleLogin}
					class="bg-surface-container-low font-headline text-on-surface hover:bg-surface-container flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition"
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
					class="bg-primary-container font-headline hover:bg-primary group flex w-full items-center justify-center gap-3 rounded-lg px-8 py-4 text-lg font-bold text-white transition"
				>
					{i18n.t('auth.signIn')}
					<span class="material-symbols-outlined transition-transform group-hover:translate-x-1">
						arrow_forward
					</span>
				</button>
			</form>

			<p class="font-body text-secondary mt-6 text-center text-sm">
				{i18n.t('auth.noAccount')}
				<a
					href={routes.register}
					class="text-primary-container hover:text-primary font-bold transition-colors"
				>
					{i18n.t('auth.signUpHere')}
				</a>
			</p>
		</div>
	</div>
</div>
