<script lang="ts">
  import type { PageData } from './$types';
  import CarsSection from '$lib/components/account/CarsSection.svelte';
  import ReviewsSection from '$lib/components/account/ReviewsSection.svelte';
  import { i18n } from '$lib/stores/i18n.svelte';

  let { data }: { data: PageData } = $props();

  const profile = $derived(data.profile);
  const genderLabel = $derived(profile.gender === 0 ? i18n.t('account.male') : i18n.t('account.female'));
</script>

<!-- Page header -->
<section class="relative pt-16 pb-12 folk-pattern-bg overflow-hidden border-b border-primary/5">
  <div class="max-w-7xl mx-auto px-8 relative z-10">
    <a href="/account" class="inline-flex items-center gap-2 mb-6 font-label text-[0.6875rem] font-bold tracking-widest text-primary/60 uppercase hover:text-primary transition-colors">
      <span class="material-symbols-outlined text-sm">arrow_back</span>
      {i18n.t('userProfile.back')}
    </a>
    <div class="inline-flex items-center gap-2 mb-3">
      <div class="h-px w-8 bg-primary/30"></div>
      <p class="font-label text-[0.6875rem] font-bold tracking-[0.3em] text-primary uppercase">{i18n.t('userProfile.bio')}</p>
    </div>
    <h1 class="font-headline text-4xl font-extrabold text-primary leading-tight tracking-tight">
      {profile.name}
    </h1>
  </div>
</section>

<div class="ia-divider w-full opacity-60"></div>

<div class="max-w-7xl mx-auto px-8 py-12 space-y-10">

  <!-- Profile details card -->
  <div class="rounded-xl bg-surface-container-lowest p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)] border border-outline-variant/15">
    <div class="mb-5 flex items-center gap-3">
      <div class="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
        <span class="material-symbols-outlined text-primary-container">account_circle</span>
      </div>
      <h2 class="font-headline text-xl font-bold text-primary">{profile.name}</h2>
    </div>

    <dl class="space-y-3">
      <div class="flex justify-between items-center py-2 border-b border-outline-variant/10">
        <dt class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('account.gender')}</dt>
        <dd class="font-body font-semibold text-on-surface text-sm">{genderLabel}</dd>
      </div>

      {#if profile.bio}
        <div class="flex justify-between items-center py-2 border-b border-outline-variant/10">
          <dt class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('userProfile.bio')}</dt>
          <dd class="font-body font-semibold text-on-surface text-sm">{profile.bio}</dd>
        </div>
      {/if}

      {#if profile.canSmoke !== undefined}
        <div class="flex justify-between items-center py-2 border-b border-outline-variant/10">
          <dt class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('userProfile.smokingAllowed')}</dt>
          <dd class="font-body font-semibold text-on-surface text-sm">{profile.canSmoke ? i18n.t('userProfile.yes') : i18n.t('userProfile.no')}</dd>
        </div>
      {/if}

      {#if profile.petFriendly !== undefined}
        <div class="flex justify-between items-center py-2">
          <dt class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{i18n.t('userProfile.petFriendly')}</dt>
          <dd class="font-body font-semibold text-on-surface text-sm">{profile.petFriendly ? i18n.t('userProfile.yes') : i18n.t('userProfile.no')}</dd>
        </div>
      {/if}
    </dl>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <CarsSection cars={profile.cars ?? []} />
    <ReviewsSection reviews={profile.reviews ?? []} />
  </div>
</div>
