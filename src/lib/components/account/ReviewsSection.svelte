<script lang="ts">
	import type { UserReview } from '$lib/types/user';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { reviews }: { reviews: UserReview[] } = $props();
</script>

<section
	class="border-heritage rounded-lg border bg-white p-6 shadow-md"
	data-review-count={reviews.length}
>
	<div class="mb-5 flex items-center gap-3">
		<div class="bg-voronet/5 flex h-10 w-10 items-center justify-center rounded-lg">
			<span class="material-symbols-outlined text-voronet" aria-hidden="true">rate_review</span>
		</div>
		<h2 class="text-charcoal text-2xl font-semibold">{i18n.t('account.reviews')}</h2>
	</div>
	<p class="bg-heritage text-charcoal rounded-lg p-4 text-base leading-relaxed" role="status">
		{i18n.t('account.noReviews')}
	</p>
</section>
