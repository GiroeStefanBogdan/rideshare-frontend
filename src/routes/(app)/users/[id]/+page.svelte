<script lang="ts">
	import type { PageData } from './$types';
	import CarsSection from '$lib/components/account/CarsSection.svelte';
	import ReviewsSection from '$lib/components/account/ReviewsSection.svelte';

	let { data }: { data: PageData } = $props();

	const profile = $derived(data.profile);
	const genderLabel = $derived(profile.gender === 0 ? 'Male' : 'Female');
</script>

<div class="space-y-8">
	<a href="/account" class="text-sm text-slate-400 hover:text-slate-200">← Back</a>

	<div class="rounded-xl bg-slate-800 p-6 shadow">
		<h1 class="mb-6 text-2xl font-bold text-white">{profile.name}</h1>

		<dl class="space-y-3 text-sm">
			<div class="flex justify-between">
				<dt class="text-slate-400">Gender</dt>
				<dd class="font-medium text-white">{genderLabel}</dd>
			</div>

			{#if profile.bio}
				<div class="flex justify-between">
					<dt class="text-slate-400">Bio</dt>
					<dd class="font-medium text-white">{profile.bio}</dd>
				</div>
			{/if}

			{#if profile.canSmoke !== undefined}
				<div class="flex justify-between">
					<dt class="text-slate-400">Smoking allowed</dt>
					<dd class="font-medium text-white">{profile.canSmoke ? 'Yes' : 'No'}</dd>
				</div>
			{/if}

			{#if profile.petFriendly !== undefined}
				<div class="flex justify-between">
					<dt class="text-slate-400">Pet friendly</dt>
					<dd class="font-medium text-white">{profile.petFriendly ? 'Yes' : 'No'}</dd>
				</div>
			{/if}
		</dl>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<CarsSection cars={profile.cars ?? []} />
		<ReviewsSection reviews={profile.reviews ?? []} />
	</div>
</div>
