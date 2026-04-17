<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { UserResponseDto } from '$lib/types/user';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { resolve } from '$app/paths';

	const PUBLIC_API_URL = env.PUBLIC_API_URL ?? 'http://localhost:8080';

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
			const res = await fetch(`${PUBLIC_API_URL}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Version': '1'
				},
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
				await goto(resolve('/login'));
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

<div class="folk-pattern-bg flex min-h-screen items-center justify-center px-4 py-16">
	<div class="w-full max-w-md">
		<!-- Brand mark -->
		<div class="mb-10 text-center">
			<a href={resolve('/')} class="font-headline text-primary text-3xl font-black tracking-tight"
				>DrumBun</a
			>
			<div class="mt-3 inline-flex items-center gap-2">
				<div class="bg-primary/30 h-px w-8"></div>
				<p class="font-label text-primary text-[0.6875rem] font-bold tracking-[0.3em] uppercase">
					{i18n.t('register.title')}
				</p>
				<div class="bg-primary/30 h-px w-8"></div>
			</div>
			<p class="font-body text-secondary mt-2 text-sm">{i18n.t('register.subtitle')}</p>
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

			<form onsubmit={handleRegister} class="space-y-4">
				<!-- Full Name -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="name"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('register.fullName')}
					</label>
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-primary/70">person</span>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="placeholder:text-outline-variant/60 text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
						/>
					</div>
				</div>

				<!-- Email -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="email"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
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
							class="placeholder:text-outline-variant/60 text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
						/>
					</div>
					{#if fieldErrors.email}
						<p class="text-error mt-1 text-xs">{fieldErrors.email}</p>
					{/if}
				</div>

				<!-- Gender -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="gender"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('register.gender')}
					</label>
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-primary/70">wc</span>
						<select
							id="gender"
							bind:value={gender}
							required
							class="text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
						>
							<option value="MALE">{i18n.t('account.male')}</option>
							<option value="FEMALE">{i18n.t('account.female')}</option>
						</select>
					</div>
				</div>

				<!-- Birthday -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="birthday"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('register.birthday')}
					</label>
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-primary/70">cake</span>
						<input
							id="birthday"
							type="date"
							bind:value={birthday}
							required
							class="text-on-surface w-full appearance-none border-none bg-transparent p-0 text-base font-bold focus:ring-0"
						/>
					</div>
					{#if fieldErrors.birthday}
						<p class="text-error mt-1 text-xs">{fieldErrors.birthday}</p>
					{/if}
				</div>

				<!-- Phone -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="phoneNumber"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('register.phone')}
					</label>
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-primary/70">phone</span>
						<input
							id="phoneNumber"
							type="tel"
							bind:value={phoneNumber}
							required
							placeholder="07XX XXX XXX"
							class="placeholder:text-outline-variant/60 text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
						/>
					</div>
					{#if fieldErrors.phoneNumber}
						<p class="text-error mt-1 text-xs">{fieldErrors.phoneNumber}</p>
					{/if}
				</div>

				<!-- Password -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="password"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('register.password')}
					</label>
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-primary/70">lock</span>
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
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
					{#if fieldErrors.password}
						<p class="text-error mt-1 text-xs">{fieldErrors.password}</p>
					{/if}
				</div>

				<!-- Confirm Password -->
				<div
					class="bg-surface-container-low/50 flex flex-col rounded-lg px-4 py-3 transition-all focus-within:bg-white focus-within:shadow-sm"
				>
					<label
						for="confirm"
						class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('register.confirmPassword')}
					</label>
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-primary/70">lock_reset</span>
						<input
							id="confirm"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirm}
							required
							class="placeholder:text-outline-variant/60 text-on-surface w-full border-none bg-transparent p-0 text-base font-bold focus:ring-0"
						/>
						<button
							type="button"
							class="font-label text-primary/70 hover:text-primary text-[0.6875rem] font-bold tracking-widest uppercase transition-colors"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
							aria-label={showConfirmPassword
								? i18n.t('auth.hidePassword')
								: i18n.t('auth.showPassword')}
						>
							{showConfirmPassword ? i18n.t('auth.hidePassword') : i18n.t('auth.showPassword')}
						</button>
					</div>
					{#if !passwordsMatch && confirm}
						<p class="text-error mt-1 text-xs">{i18n.t('register.passwordsDoNotMatch')}</p>
					{/if}
				</div>

				<!-- Newsletter -->
				<label class="flex cursor-pointer items-center gap-3 px-1">
					<input
						id="newsletter"
						type="checkbox"
						bind:checked={newsletter}
						class="form-checkbox border-outline-variant text-primary-container focus:ring-primary h-4 w-4 rounded"
					/>
					<span class="font-body text-secondary text-sm">{i18n.t('register.newsletter')}</span>
				</label>

				<!-- Submit -->
				<button
					type="submit"
					disabled={!passwordsMatch}
					class="bg-primary-container font-headline hover:bg-primary group flex w-full items-center justify-center gap-3 rounded-lg px-8 py-4 text-lg font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
				>
					{i18n.t('register.createButton')}
					<span class="material-symbols-outlined transition-transform group-hover:translate-x-1"
						>arrow_forward</span
					>
				</button>
			</form>

			<p class="font-body text-secondary mt-6 text-center text-sm">
				{i18n.t('register.alreadyHaveAccount')}
				<a
					href={resolve('/login')}
					class="text-primary-container hover:text-primary font-bold transition-colors"
					>{i18n.t('register.loginHere')}</a
				>
			</p>
		</div>
	</div>
</div>
