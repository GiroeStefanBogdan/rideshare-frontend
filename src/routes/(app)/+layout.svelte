<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { logout } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { children, data } = $props();
	let mobileMenuOpen = $state(false);
	let accountMenuOpen = $state(false);
	let loggingOut = $state(false);

	$effect(() => {
		if (data.user) authStore.setUser(data.user);
		else authStore.clear();
	});

	function closeMenus() {
		mobileMenuOpen = false;
		accountMenuOpen = false;
	}

	async function handleLogout() {
		if (loggingOut) return;
		loggingOut = true;
		try {
			await logout();
		} finally {
			authStore.clear();
			closeMenus();
			await goto(resolve('/login?loggedOut=true'));
			loggingOut = false;
		}
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeMenus();
	}

	function handleWindowClick(event: MouseEvent) {
		if (!(event.target as Element).closest('header')) closeMenus();
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} onclick={handleWindowClick} />

<div class="bg-surface text-on-surface font-body flex min-h-screen flex-col">
	<header class="border-heritage bg-soft-white/95 sticky top-0 z-50 border-b backdrop-blur">
		<nav
			class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8"
			aria-label={i18n.t('nav.primary')}
		>
			<a
				href={resolve('/')}
				class="font-headline text-voronet text-2xl font-black tracking-tight"
				onclick={closeMenus}>DrumBun</a
			>

			<div class="hidden items-center gap-6 md:flex">
				<div class="border-heritage bg-heritage flex gap-1 rounded-md border p-1">
					<button
						type="button"
						class="rounded-md px-2 py-1 text-xs font-bold {i18n.lang === 'ro'
							? 'bg-voronet text-white'
							: 'text-charcoal hover:bg-white'}"
						onclick={() => i18n.setLang('ro')}
						aria-pressed={i18n.lang === 'ro'}>RO</button
					>
					<button
						type="button"
						class="rounded-md px-2 py-1 text-xs font-bold {i18n.lang === 'en'
							? 'bg-voronet text-white'
							: 'text-charcoal hover:bg-white'}"
						onclick={() => i18n.setLang('en')}
						aria-pressed={i18n.lang === 'en'}>EN</button
					>
				</div>
				<a
					href={resolve('/rides')}
					class="text-charcoal hover:text-voronet font-semibold transition-colors"
					>{i18n.t('nav.findRide')}</a
				>
				<a
					href={resolve('/publish')}
					class="text-charcoal hover:text-voronet font-semibold transition-colors"
					>{i18n.t('nav.offerRide')}</a
				>
				<div class="relative">
					<button
						type="button"
						class="border-voronet text-voronet hover:bg-voronet/5 flex items-center gap-2 rounded-lg border px-4 py-2 font-semibold"
						aria-expanded={accountMenuOpen}
						aria-controls="desktop-account-menu"
						onclick={() => (accountMenuOpen = !accountMenuOpen)}
					>
						<span class="material-symbols-outlined" aria-hidden="true">account_circle</span>
						{authStore.user ? authStore.user.name : i18n.t('nav.login')}
					</button>
					{#if accountMenuOpen}
						<div
							id="desktop-account-menu"
							class="border-heritage absolute right-0 mt-2 w-52 rounded-lg border bg-white p-2 shadow-md"
						>
							{#if authStore.user}
								<a
									href={resolve('/account')}
									class="hover:bg-heritage block rounded-lg px-4 py-3 font-semibold"
									onclick={closeMenus}>{i18n.t('nav.account')}</a
								>
								<button
									type="button"
									class="hover:bg-heritage text-charcoal w-full rounded-lg px-4 py-3 text-left font-semibold"
									disabled={loggingOut}
									onclick={handleLogout}
									>{loggingOut ? i18n.t('nav.loggingOut') : i18n.t('nav.logout')}</button
								>
							{:else}
								<a
									href={resolve('/login')}
									class="hover:bg-heritage block rounded-lg px-4 py-3 font-semibold"
									onclick={closeMenus}>{i18n.t('nav.login')}</a
								>
								<a
									href={resolve('/register')}
									class="hover:bg-heritage block rounded-lg px-4 py-3 font-semibold"
									onclick={closeMenus}>{i18n.t('nav.register')}</a
								>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<button
				type="button"
				class="border-voronet text-voronet flex rounded-lg border p-2 md:hidden"
				aria-label={mobileMenuOpen ? i18n.t('nav.closeMenu') : i18n.t('nav.openMenu')}
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-menu"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			>
				<span class="material-symbols-outlined" aria-hidden="true"
					>{mobileMenuOpen ? 'close' : 'menu'}</span
				>
			</button>
		</nav>

		{#if mobileMenuOpen}
			<div id="mobile-menu" class="border-heritage bg-soft-white border-t px-4 py-4 md:hidden">
				<div class="mx-auto flex max-w-7xl flex-col gap-1">
					<a
						href={resolve('/rides')}
						class="hover:bg-heritage rounded-lg px-4 py-3 font-semibold"
						onclick={closeMenus}>{i18n.t('nav.findRide')}</a
					>
					<a
						href={resolve('/publish')}
						class="hover:bg-heritage rounded-lg px-4 py-3 font-semibold"
						onclick={closeMenus}>{i18n.t('nav.offerRide')}</a
					>
					{#if authStore.user}
						<a
							href={resolve('/account')}
							class="hover:bg-heritage rounded-lg px-4 py-3 font-semibold"
							onclick={closeMenus}>{i18n.t('nav.account')}</a
						>
						<button
							type="button"
							class="hover:bg-heritage rounded-lg px-4 py-3 text-left font-semibold"
							disabled={loggingOut}
							onclick={handleLogout}
							>{loggingOut ? i18n.t('nav.loggingOut') : i18n.t('nav.logout')}</button
						>
					{:else}
						<a
							href={resolve('/login')}
							class="hover:bg-heritage rounded-lg px-4 py-3 font-semibold"
							onclick={closeMenus}>{i18n.t('nav.login')}</a
						>
						<a
							href={resolve('/register')}
							class="hover:bg-heritage rounded-lg px-4 py-3 font-semibold"
							onclick={closeMenus}>{i18n.t('nav.register')}</a
						>
					{/if}
					<div class="border-heritage mt-2 flex items-center justify-between border-t px-4 pt-4">
						<span class="text-xs font-semibold tracking-widest uppercase"
							>{i18n.t('nav.language')}</span
						>
						<div class="flex gap-2">
							<button
								type="button"
								class="rounded-md px-3 py-2 text-xs font-bold {i18n.lang === 'ro'
									? 'bg-voronet text-white'
									: 'bg-heritage'}"
								onclick={() => i18n.setLang('ro')}
								aria-pressed={i18n.lang === 'ro'}>RO</button
							>
							<button
								type="button"
								class="rounded-md px-3 py-2 text-xs font-bold {i18n.lang === 'en'
									? 'bg-voronet text-white'
									: 'bg-heritage'}"
								onclick={() => i18n.setLang('en')}
								aria-pressed={i18n.lang === 'en'}>EN</button
							>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</header>

	<main class="flex-1">{@render children()}</main>

	<footer class="ia-border-accent border-heritage border-t bg-white">
		<div
			class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-4 py-16 md:flex-row md:px-8"
		>
			<div class="mb-10 md:mb-0">
				<span class="font-headline text-voronet text-2xl font-black">DrumBun</span>
				<p class="text-charcoal mt-4 max-w-xs text-sm leading-relaxed">
					{i18n.t('footer.tagline')}
				</p>
			</div>
			<div class="flex flex-wrap justify-center gap-8">
				<a class="text-charcoal hover:text-voronet text-sm font-semibold" href={resolve('/terms')}
					>{i18n.t('footer.terms')}</a
				>
				<a class="text-charcoal hover:text-voronet text-sm font-semibold" href={resolve('/privacy')}
					>{i18n.t('footer.privacy')}</a
				>
				<a class="text-charcoal hover:text-voronet text-sm font-semibold" href={resolve('/contact')}
					>{i18n.t('footer.contact')}</a
				>
			</div>
			<p class="text-charcoal/60 mt-10 text-xs md:mt-0">
				© {new Date().getFullYear()} DrumBun — {i18n.t('footer.copyright')}
			</p>
		</div>
	</footer>
</div>
