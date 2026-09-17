<script lang="ts">
	import type { Review } from '$lib/types/review';
	import { i18n } from '$lib/stores/i18n.svelte';

	let {
		review,
		showModeration = false,
		onModerate
	}: {
		review: Review;
		showModeration?: boolean;
		onModerate?: (review: Review, action: 'hide' | 'restore') => void;
	} = $props();

	const stars = $derived([1, 2, 3, 4, 5]);
	const score = $derived(review.score ?? 0);
	const roleLabel = $derived(
		review.role === 'DRIVER'
			? i18n.t('reviews.writtenAsDriver')
			: i18n.t('reviews.writtenAsPassenger')
	);
	const publishedOn = $derived(
		review.publishedAt ? new Date(review.publishedAt).toLocaleDateString() : ''
	);
</script>

<article class="border-heritage rounded-lg border bg-white p-4" data-review-id={review.id}>
	<header class="mb-2 flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<span class="text-charcoal text-sm font-semibold">{review.authorName}</span>
			<span class="bg-heritage text-charcoal rounded-lg px-2 py-0.5 text-xs font-semibold">
				{roleLabel}
			</span>
		</div>
		<div class="flex items-center gap-1" aria-label={i18n.t('reviews.scoreLabel')}>
			{#each stars as star (star)}
				<span
					class="material-symbols-outlined text-[18px] {star <= score
						? 'text-voronet'
						: 'text-heritage'}"
					aria-hidden="true">star</span
				>
			{/each}
			<span class="text-charcoal text-sm font-semibold">{score}/5</span>
		</div>
	</header>

	{#if review.details}
		<p class="text-charcoal text-base leading-relaxed">{review.details}</p>
	{/if}

	{#if review.pending && review.pendingScore !== null}
		<p class="bg-heritage text-charcoal mt-3 rounded-lg p-3 text-sm" role="status">
			{i18n.t('reviews.pendingEditor')}: {review.pendingScore}/5
		</p>
	{/if}

	<footer class="mt-3 flex flex-wrap items-center justify-between gap-2">
		<p class="text-charcoal text-xs">
			{publishedOn}
			{#if review.edited}
				· {i18n.t('reviews.edited')}
			{/if}
			{#if !review.published && review.pending}
				· {i18n.t('reviews.awaitingOther')}
			{/if}
		</p>

		{#if showModeration && onModerate}
			<button
				type="button"
				class="text-voronet text-sm font-semibold hover:opacity-90"
				onclick={() => onModerate(review, review.status === 'HIDDEN' ? 'restore' : 'hide')}
			>
				{review.status === 'HIDDEN' ? i18n.t('reviews.restore') : i18n.t('reviews.hide')}
			</button>
		{/if}
	</footer>
</article>
