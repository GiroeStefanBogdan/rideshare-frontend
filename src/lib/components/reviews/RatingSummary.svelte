<script lang="ts">
	import type { RatingSummary as RatingSummaryDto } from '$lib/types/review';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { summary }: { summary: RatingSummaryDto } = $props();

	const rated = $derived(summary.count > 0 && summary.average !== null);
</script>

{#if rated}
	<div class="flex items-center gap-1.5" data-rating-average={summary.average}>
		<span class="text-voronet material-symbols-outlined text-[20px]" aria-hidden="true">star</span>
		<span class="text-charcoal text-sm font-semibold">{summary.average?.toFixed(1)}</span>
		<span class="text-charcoal text-sm"
			>({summary.count}
			{i18n.t('reviews.count')})</span
		>
	</div>
{:else}
	<p class="text-charcoal text-sm" data-rating-absent>{i18n.t('reviews.none')}</p>
{/if}
