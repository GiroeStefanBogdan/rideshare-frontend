<script lang="ts">
	import type { UserReview } from '$lib/types/user';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { reviews }: { reviews: UserReview[] } = $props();
</script>

<div
	class="bg-surface-container-lowest border-outline-variant/15 rounded-xl border p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)]"
>
	<div class="mb-5 flex items-center gap-3">
		<div class="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
			<span class="material-symbols-outlined text-primary-container">star</span>
		</div>
		<h2 class="font-headline text-primary text-xl font-bold">{i18n.t('account.reviews')}</h2>
	</div>

	{#if reviews.length === 0}
		<p class="font-body text-secondary text-sm">{i18n.t('account.noReviews')}</p>
	{:else}
		<ul class="space-y-4">
			{#each reviews as review (review.id)}
				<li class="bg-surface-container-low rounded-lg px-4 py-4">
					<div class="mb-2 flex items-center justify-between">
						<span
							class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
						>
							{i18n.t('account.reviewer')} #{review.reviewerId}
						</span>
						<span
							class="font-label text-secondary/50 text-[0.6875rem] font-bold tracking-widest uppercase"
						>
							{new Date(review.date).toLocaleDateString(i18n.lang === 'ro' ? 'ro-RO' : 'en-US', {
								year: 'numeric',
								month: 'short',
								day: 'numeric'
							})}
						</span>
					</div>
					<div class="mb-2 flex gap-0.5">
						{#each [0, 1, 2, 3, 4] as i (i)}
							<span class={i < review.score ? 'text-primary-container' : 'text-outline-variant'}
								>★</span
							>
						{/each}
					</div>
					{#if review.details}
						<p class="font-body text-secondary text-sm leading-relaxed">{review.details}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
