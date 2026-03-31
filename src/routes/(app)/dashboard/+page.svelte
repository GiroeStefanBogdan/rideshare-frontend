<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	let { data } = $props();
	let { email }: { email: string | null } = data;
</script>

<!-- Hero Section & Search Module -->
<section class="folk-pattern-bg border-primary/5 relative overflow-hidden border-b pt-20 pb-28">
	<div class="relative z-10 mx-auto max-w-7xl px-8">
		<div class="mb-14 max-w-3xl">
			<div class="mb-4 inline-flex items-center gap-2">
				<div class="bg-primary/30 h-px w-8"></div>
				<p class="font-label text-primary text-[0.6875rem] font-bold tracking-[0.3em] uppercase">
					{i18n.t('hero.tagline')}
				</p>
			</div>
			<h1
				class="font-headline text-primary mb-6 text-5xl leading-tight font-extrabold tracking-tight md:text-6xl"
			>
				{i18n.t('hero.title')}
			</h1>
			<p class="text-secondary font-body max-w-xl text-xl">
				{i18n.t('hero.description')}
			</p>

			{#if email}
				<div
					class="bg-primary/5 border-primary/10 mt-8 inline-flex items-center gap-3 rounded-lg border px-4 py-2"
				>
					<span class="material-symbols-outlined text-primary" data-icon="account_circle"
						>account_circle</span
					>
					<div>
						<p class="text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase">
							{i18n.t('hero.signedInAs')}
						</p>
						<p class="font-headline text-primary font-bold">{email}</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Search Module with IA accent -->
		<div
			class="glass-panel border-outline-variant/20 ia-border-accent flex flex-col items-stretch gap-2 rounded-xl border p-2 shadow-[0_40px_100px_rgba(0,32,104,0.08)] md:flex-row md:p-4"
		>
			<div
				class="bg-surface-container-low/50 flex flex-1 flex-col rounded-lg px-6 py-4 transition-all focus-within:bg-white focus-within:shadow-sm"
			>
				<label
					for="search-from"
					class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>{i18n.t('search.from')}</label
				>
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-primary/70" data-icon="location_on"
						>location_on</span
					>
					<input
						id="search-from"
						class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-lg font-bold focus:ring-0"
						placeholder={i18n.t('search.fromPlaceholder')}
						type="text"
					/>
				</div>
			</div>
			<div
				class="bg-surface-container-low/50 flex flex-1 flex-col rounded-lg px-6 py-4 transition-all focus-within:bg-white"
			>
				<label
					for="search-to"
					class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>{i18n.t('search.to')}</label
				>
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-primary/70" data-icon="near_me">near_me</span>
					<input
						id="search-to"
						class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-lg font-bold focus:ring-0"
						placeholder={i18n.t('search.toPlaceholder')}
						type="text"
					/>
				</div>
			</div>
			<div
				class="bg-surface-container-low/50 flex flex-1 flex-col rounded-lg px-6 py-4 transition-all focus-within:bg-white"
			>
				<label
					for="search-date"
					class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
					>{i18n.t('search.date')}</label
				>
				<div class="flex items-center gap-3">
					<span class="material-symbols-outlined text-primary/70" data-icon="calendar_today"
						>calendar_today</span
					>
					<input
						id="search-date"
						class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-lg font-bold focus:ring-0"
						placeholder={i18n.t('search.datePlaceholder')}
						type="text"
					/>
				</div>
			</div>
			<button
				class="bg-primary-container font-headline hover:bg-primary group flex items-center justify-center gap-3 rounded-lg px-10 py-6 text-lg font-bold text-white transition-all"
			>
				{i18n.t('search.button')}
				<span
					class="material-symbols-outlined transition-transform group-hover:translate-x-1"
					data-icon="arrow_forward">arrow_forward</span
				>
			</button>
		</div>
	</div>

	<!-- Decorative Folk Detail -->
	<div
		class="pointer-events-none absolute -right-24 -bottom-24 hidden scale-150 opacity-5 xl:block"
	>
		<span
			class="material-symbols-outlined text-[30rem]"
			data-icon="hub"
			style="font-variation-settings: 'FILL' 0, 'wght' 100;">hub</span
		>
	</div>
</section>

<!-- IA Pattern Divider -->
<div class="ia-divider w-full opacity-60"></div>

<!-- Values Section with watermark motifs -->
<section class="bg-surface-container-low/40 relative overflow-hidden py-28">
	<div class="folk-watermark absolute inset-0 opacity-40"></div>
	<div class="relative z-10 mx-auto max-w-7xl px-8">
		<div class="grid grid-cols-1 gap-16 md:grid-cols-3">
			<div class="group space-y-6">
				<div
					class="border-outline-variant/10 flex h-16 w-16 items-center justify-center rounded-xl border bg-white shadow-sm transition-all group-hover:shadow-md"
				>
					<span
						class="material-symbols-outlined text-primary-container text-4xl"
						data-icon="diversity_3">diversity_3</span
					>
				</div>
				<h3 class="font-headline text-primary text-2xl font-bold">
					{i18n.t('values.communityTitle')}
				</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.communityDesc')}</p>
			</div>
			<div class="group space-y-6">
				<div
					class="border-outline-variant/10 flex h-16 w-16 items-center justify-center rounded-xl border bg-white shadow-sm transition-all group-hover:shadow-md"
				>
					<span
						class="material-symbols-outlined text-primary-container text-4xl"
						data-icon="verified_user">verified_user</span
					>
				</div>
				<h3 class="font-headline text-primary text-2xl font-bold">
					{i18n.t('values.safetyTitle')}
				</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.safetyDesc')}</p>
			</div>
			<div class="group space-y-6">
				<div
					class="border-outline-variant/10 flex h-16 w-16 items-center justify-center rounded-xl border bg-white shadow-sm transition-all group-hover:shadow-md"
				>
					<span class="material-symbols-outlined text-primary-container text-4xl" data-icon="eco"
						>eco</span
					>
				</div>
				<h3 class="font-headline text-primary text-2xl font-bold">
					{i18n.t('values.natureTitle')}
				</h3>
				<p class="text-secondary leading-relaxed">{i18n.t('values.natureDesc')}</p>
			</div>
		</div>
	</div>
</section>
