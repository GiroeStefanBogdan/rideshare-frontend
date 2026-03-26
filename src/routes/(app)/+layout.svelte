<script lang="ts">
 import { i18n } from '$lib/stores/i18n.svelte';
 import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		i18n.init();
	});
</script>

<div class="flex min-h-screen flex-col bg-surface text-on-surface font-body">
	<!-- Header -->
	<header class="sticky top-0 z-50 border-b border-outline-variant/10 bg-surface/90 backdrop-blur">
		<nav class="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6">
			<div class="flex items-center gap-4">
				<a href="/" class="font-headline text-2xl font-black tracking-tight text-primary">DrumBun</a>
			</div>
			<div class="flex items-center gap-8">
				<div class="hidden md:flex gap-6 items-center">
					<div class="flex gap-2 mr-4 bg-primary/5 p-1 rounded-md border border-primary/10">
						<button 
							class="px-2 py-0.5 text-xs font-bold rounded transition-colors {i18n.lang === 'ro' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/10'}"
							onclick={() => i18n.setLang('ro')}
						>
							RO
						</button>
						<button 
							class="px-2 py-0.5 text-xs font-bold rounded transition-colors {i18n.lang === 'en' ? 'bg-primary text-white' : 'text-primary hover:bg-primary/10'}"
							onclick={() => i18n.setLang('en')}
						>
							EN
						</button>
					</div>
					<a href="/rides" class="font-headline font-bold text-secondary hover:text-primary transition-colors duration-300">{i18n.t('nav.findRide')}</a>
					<a href="/publish" class="font-headline font-bold text-secondary hover:text-primary transition-colors duration-300">{i18n.t('nav.offerRide')}</a>
				</div>
				<div class="flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-300 cursor-pointer">
					<a href="/account" class="flex items-center" aria-label={i18n.t('nav.account')}>
						<span class="material-symbols-outlined text-2xl">account_circle</span>
					</a>
				</div>
			</div>
		</nav>
	</header>

	<!-- Page content -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="ia-border-accent border-t border-outline-variant/10 bg-white">
		<div class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-8 py-16 md:flex-row">
			<div class="mb-10 md:mb-0">
				<span class="font-headline text-2xl font-black text-primary">DrumBun</span>
				<p class="mt-4 max-w-xs font-body text-sm leading-relaxed text-secondary/70">
					{i18n.t('footer.tagline')}
				</p>
			</div>
			<div class="flex flex-wrap justify-center gap-10">
 			<a class="font-body text-sm font-semibold text-secondary transition-all hover:text-primary" href="/terms">{i18n.t('footer.terms')}</a>
				<a class="font-body text-sm font-semibold text-secondary transition-all hover:text-primary" href="/privacy">{i18n.t('footer.privacy')}</a>
				<a class="font-body text-sm font-semibold text-secondary transition-all hover:text-primary" href="/contact">{i18n.t('footer.contact')}</a>
			</div>
			<div class="mt-10 md:mt-0 text-right">
				<p class="font-body text-xs leading-relaxed text-secondary/50">
					© {new Date().getFullYear()} DrumBun - {i18n.t('footer.copyright')}
				</p>
				<div class="mt-2 flex justify-end gap-2 opacity-30">
					<span class="material-symbols-outlined text-xs">close</span>
					<span class="material-symbols-outlined text-xs">close</span>
				</div>
			</div>
		</div>
	</footer>
</div>
