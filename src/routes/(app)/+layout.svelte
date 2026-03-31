<script lang="ts">
	import { resolve } from '$app/paths';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { children } = $props();
</script>

<div class="bg-surface text-on-surface font-body flex min-h-screen flex-col">
	<!-- Header -->
	<header class="border-outline-variant/10 bg-surface/90 sticky top-0 z-50 border-b backdrop-blur">
		<nav class="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6">
			<div class="flex items-center gap-4">
				<a href={resolve('/')} class="font-headline text-primary text-2xl font-black tracking-tight"
					>DrumBun</a
				>
			</div>
			<div class="flex items-center gap-8">
				<div class="hidden items-center gap-6 md:flex">
					<div class="bg-primary/5 border-primary/10 mr-4 flex gap-2 rounded-md border p-1">
						<button
							class="rounded px-2 py-0.5 text-xs font-bold transition-colors {i18n.lang === 'ro'
								? 'bg-primary text-white'
								: 'text-primary hover:bg-primary/10'}"
							onclick={() => i18n.setLang('ro')}
						>
							RO
						</button>
						<button
							class="rounded px-2 py-0.5 text-xs font-bold transition-colors {i18n.lang === 'en'
								? 'bg-primary text-white'
								: 'text-primary hover:bg-primary/10'}"
							onclick={() => i18n.setLang('en')}
						>
							EN
						</button>
					</div>
					<a
						href={resolve('/rides')}
						class="font-headline text-secondary hover:text-primary font-bold transition-colors duration-300"
						>{i18n.t('nav.findRide')}</a
					>
					<a
						href={resolve('/publish')}
						class="font-headline text-secondary hover:text-primary font-bold transition-colors duration-300"
						>{i18n.t('nav.offerRide')}</a
					>
				</div>
				<div
					class="text-secondary hover:text-primary flex cursor-pointer items-center gap-2 transition-colors duration-300"
				>
					<a
						href={resolve('/account')}
						class="flex items-center"
						aria-label={i18n.t('nav.account')}
					>
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
	<footer class="ia-border-accent border-outline-variant/10 border-t bg-white">
		<div
			class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-8 py-16 md:flex-row"
		>
			<div class="mb-10 md:mb-0">
				<span class="font-headline text-primary text-2xl font-black">DrumBun</span>
				<p class="font-body text-secondary/70 mt-4 max-w-xs text-sm leading-relaxed">
					{i18n.t('footer.tagline')}
				</p>
			</div>
			<div class="flex flex-wrap justify-center gap-10">
				<a
					class="font-body text-secondary hover:text-primary text-sm font-semibold transition-all"
					href={resolve('/terms')}>{i18n.t('footer.terms')}</a
				>
				<a
					class="font-body text-secondary hover:text-primary text-sm font-semibold transition-all"
					href={resolve('/privacy')}>{i18n.t('footer.privacy')}</a
				>
				<a
					class="font-body text-secondary hover:text-primary text-sm font-semibold transition-all"
					href={resolve('/contact')}>{i18n.t('footer.contact')}</a
				>
			</div>
			<div class="mt-10 text-right md:mt-0">
				<p class="font-body text-secondary/50 text-xs leading-relaxed">
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
