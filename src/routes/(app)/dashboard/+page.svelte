<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	let { data } = $props();
	let { email }: { email: string | null } = data;
</script>

<!-- Hero Section & Search Module -->
<section class="relative pt-20 pb-28 folk-pattern-bg overflow-hidden border-b border-primary/5">
	<div class="max-w-7xl mx-auto px-8 relative z-10">
		<div class="max-w-3xl mb-14">
			<div class="inline-flex items-center gap-2 mb-4">
				<div class="h-px w-8 bg-primary/30"></div>
				<p class="font-label text-[0.6875rem] font-bold tracking-[0.3em] text-primary uppercase">{i18n.t('hero.tagline')}</p>
			</div>
			<h1 class="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight mb-6">
				{i18n.t('hero.title')}
			</h1>
			<p class="text-secondary font-body text-xl max-w-xl">
				{i18n.t('hero.description')}
			</p>

			{#if email}
				<div class="mt-8 inline-flex items-center gap-3 rounded-lg bg-primary/5 px-4 py-2 border border-primary/10">
					<span class="material-symbols-outlined text-primary" data-icon="account_circle">account_circle</span>
					<div>
						<p class="text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('hero.signedInAs')}</p>
						<p class="font-headline font-bold text-primary">{email}</p>
					</div>
				</div>
			{:else}
				<div class="mt-8 inline-flex items-center gap-3 rounded-lg bg-error/5 px-4 py-2 border border-error/10">
					<span class="material-symbols-outlined text-error">error</span>
					<div>
						<p class="text-[0.6875rem] font-bold tracking-widest text-error/70 uppercase">{i18n.t('hero.notAuthenticated')}</p>
						<p class="font-body text-sm text-secondary">
							{i18n.t('hero.pleaseLogin')} <a href="/login" class="text-primary font-bold underline">{i18n.t('hero.loginLink')}</a> {i18n.t('hero.accessDashboard')}
						</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Search Module with IA accent -->
		<div class="glass-panel rounded-xl shadow-[0_40px_100px_rgba(0,32,104,0.08)] p-2 md:p-4 flex flex-col md:flex-row items-stretch gap-2 border border-outline-variant/20 ia-border-accent">
			<div class="flex-1 flex flex-col px-6 py-4 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white focus-within:shadow-sm">
				<label for="search-from" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">{i18n.t('search.from')}</label>
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-primary/70" data-icon="location_on">location_on</span>
					<input id="search-from" class="bg-transparent border-none p-0 w-full focus:ring-0 text-lg font-bold placeholder:text-outline-variant/60" placeholder={i18n.t('search.fromPlaceholder')} type="text"/>
				</div>
			</div>
			<div class="flex-1 flex flex-col px-6 py-4 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white">
				<label for="search-to" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">{i18n.t('search.to')}</label>
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-primary/70" data-icon="near_me">near_me</span>
					<input id="search-to" class="bg-transparent border-none p-0 w-full focus:ring-0 text-lg font-bold placeholder:text-outline-variant/60" placeholder={i18n.t('search.toPlaceholder')} type="text"/>
				</div>
			</div>
			<div class="flex-1 flex flex-col px-6 py-4 bg-surface-container-low/50 rounded-lg transition-all focus-within:bg-white">
				<label for="search-date" class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase mb-1">{i18n.t('search.date')}</label>
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-primary/70" data-icon="calendar_today">calendar_today</span>
					<input id="search-date" class="bg-transparent border-none p-0 w-full focus:ring-0 text-lg font-bold placeholder:text-outline-variant/60" placeholder={i18n.t('search.datePlaceholder')} type="text"/>
				</div>
			</div>
			<button class="bg-primary-container text-white px-10 py-6 rounded-lg font-headline font-bold text-lg hover:bg-primary transition-all flex items-center justify-center gap-3 group">
				{i18n.t('search.button')}
				<span class="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
			</button>
		</div>
	</div>

	<!-- Decorative Folk Detail -->
	<div class="absolute -bottom-24 -right-24 opacity-5 pointer-events-none hidden xl:block scale-150">
		<span class="material-symbols-outlined text-[30rem]" data-icon="hub" style="font-variation-settings: 'FILL' 0, 'wght' 100;">hub</span>
	</div>
</section>

<!-- IA Pattern Divider -->
<div class="ia-divider w-full opacity-60"></div>

<!-- Values Section with watermark motifs -->
<section class="bg-surface-container-low/40 py-28 relative overflow-hidden">
	<div class="absolute inset-0 folk-watermark opacity-40"></div>
	<div class="max-w-7xl mx-auto px-8 relative z-10">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-16">
			<div class="space-y-6 group">
				<div class="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all border border-outline-variant/10">
					<span class="material-symbols-outlined text-4xl text-primary-container" data-icon="diversity_3">diversity_3</span>
				</div>
				<h3 class="font-headline text-2xl font-bold text-primary">{i18n.t('values.communityTitle')}</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.communityDesc')}</p>
			</div>
			<div class="space-y-6 group">
				<div class="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all border border-outline-variant/10">
					<span class="material-symbols-outlined text-4xl text-primary-container" data-icon="verified_user">verified_user</span>
				</div>
				<h3 class="font-headline text-2xl font-bold text-primary">{i18n.t('values.safetyTitle')}</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.safetyDesc')}</p>
			</div>
			<div class="space-y-6 group">
				<div class="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:shadow-md transition-all border border-outline-variant/10">
					<span class="material-symbols-outlined text-4xl text-primary-container" data-icon="eco">eco</span>
				</div>
				<h3 class="font-headline text-2xl font-bold text-primary">{i18n.t('values.natureTitle')}</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.natureDesc')}</p>
			</div>
		</div>
	</div>
</section>
