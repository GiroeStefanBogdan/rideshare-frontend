<script lang="ts">
	import type { PageData } from './$types';
	import CarsSection from '$lib/components/account/CarsSection.svelte';
	import ReviewsSection from '$lib/components/account/ReviewsSection.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();

	const profile = $derived(data.profile);
	const genderLabel = $derived(
		profile.gender === 'MALE' ? i18n.t('account.male') : i18n.t('account.female')
	);
</script>

<!-- Page header -->
<section class="folk-pattern-bg border-primary/5 relative overflow-hidden border-b pt-16 pb-12">
	<div class="relative z-10 mx-auto max-w-7xl px-8">
		<a
			href={resolve('/account')}
			class="font-label text-primary/60 hover:text-primary mb-6 inline-flex items-center gap-2 text-[0.6875rem] font-bold tracking-widest uppercase transition-colors"
		>
			<span class="material-symbols-outlined text-sm">arrow_back</span>
			{i18n.t('userProfile.back')}
		</a>
		<div class="mb-3 inline-flex items-center gap-2">
			<div class="bg-primary/30 h-px w-8"></div>
			<p class="font-label text-primary text-[0.6875rem] font-bold tracking-[0.3em] uppercase">
				{i18n.t('userProfile.bio')}
			</p>
		</div>
		<h1 class="font-headline text-primary text-4xl leading-tight font-extrabold tracking-tight">
			{profile.name}
		</h1>
	</div>
</section>

<div class="ia-divider w-full opacity-60"></div>

<div class="mx-auto max-w-7xl space-y-10 px-8 py-12">
	<!-- Profile details card -->
	<div
		class="bg-surface-container-lowest border-outline-variant/15 rounded-xl border p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)]"
	>
		<div class="mb-5 flex items-center gap-3">
			<div class="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
				<span class="material-symbols-outlined text-primary-container">account_circle</span>
			</div>
			<h2 class="font-headline text-primary text-xl font-bold">{profile.name}</h2>
		</div>

		<dl class="space-y-3">
			<div class="border-outline-variant/10 flex items-center justify-between border-b py-2">
				<dt
					class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
				>
					{i18n.t('account.gender')}
				</dt>
				<dd class="font-body text-on-surface text-sm font-semibold">{genderLabel}</dd>
			</div>

			{#if profile.bio}
				<div class="border-outline-variant/10 flex items-center justify-between border-b py-2">
					<dt
						class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('userProfile.bio')}
					</dt>
					<dd class="font-body text-on-surface text-sm font-semibold">{profile.bio}</dd>
				</div>
			{/if}

			{#if profile.canSmoke !== undefined}
				<div class="border-outline-variant/10 flex items-center justify-between border-b py-2">
					<dt
						class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('userProfile.smokingAllowed')}
					</dt>
					<dd class="font-body text-on-surface text-sm font-semibold">
						{profile.canSmoke ? i18n.t('userProfile.yes') : i18n.t('userProfile.no')}
					</dd>
				</div>
			{/if}

			{#if profile.petFriendly !== undefined}
				<div class="flex items-center justify-between py-2">
					<dt
						class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
					>
						{i18n.t('userProfile.petFriendly')}
					</dt>
					<dd class="font-body text-on-surface text-sm font-semibold">
						{profile.petFriendly ? i18n.t('userProfile.yes') : i18n.t('userProfile.no')}
					</dd>
				</div>
			{/if}
		</dl>
	</div>

	{#if profile.cars !== undefined || profile.reviews !== undefined}
		<div class="grid gap-6 lg:grid-cols-2">
			{#if profile.cars !== undefined}
				<CarsSection cars={profile.cars} editable={false} />
			{/if}
			{#if profile.reviews !== undefined}
				<ReviewsSection reviews={profile.reviews} />
			{/if}
		</div>
	{/if}
</div>
