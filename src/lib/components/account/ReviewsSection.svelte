<script lang="ts">
	import type { RatingSummary as RatingSummaryDto, Review } from '$lib/types/review';
	import RatingSummary from '$lib/components/reviews/RatingSummary.svelte';
	import ReviewCard from '$lib/components/reviews/ReviewCard.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';

	let {
		summary,
		reviews = [],
		showModeration = false,
		onModerate
	}: {
		summary: RatingSummaryDto;
		reviews?: Review[];
		showModeration?: boolean;
		onModerate?: (review: Review, action: 'hide' | 'restore') => void;
	} = $props();
</script>

<section
	class="border-heritage rounded-lg border bg-white p-6 shadow-md"
	data-review-count={reviews.length}
>
	<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<div class="bg-voronet/5 flex h-10 w-10 items-center justify-center rounded-lg">
				<span class="material-symbols-outlined text-voronet" aria-hidden="true">rate_review</span>
			</div>
			<h2 class="text-charcoal text-2xl font-semibold">{i18n.t('account.reviews')}</h2>
		</div>
		<RatingSummary {summary} />
	</div>

	{#if reviews.length === 0}
		<p class="bg-heritage text-charcoal rounded-lg p-4 text-base leading-relaxed" role="status">
			{i18n.t('reviews.noneYet')}
		</p>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each reviews as review (review.id)}
				<li>
					<ReviewCard {review} {showModeration} {onModerate} />
				</li>
			{/each}
		</ul>
	{/if}
</section>
