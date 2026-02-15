<script lang="ts">
	import type { UserReview } from '$lib/types/user';

	let { reviews }: { reviews: UserReview[] } = $props();

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="rounded-xl bg-slate-800 p-6 shadow">
	<h2 class="mb-4 text-xl font-semibold text-white">Reviews</h2>

	{#if reviews.length === 0}
		<p class="text-sm text-slate-400">No reviews yet.</p>
	{:else}
		<ul class="space-y-4">
			{#each reviews as review (review.id)}
				<li class="rounded-lg bg-slate-700 px-4 py-3">
					<div class="mb-1 flex items-center justify-between">
						<span class="text-sm font-medium text-slate-300">User #{review.reviewerId}</span>
						<span class="text-xs text-slate-500">{formatDate(review.date)}</span>
					</div>
					<div class="mb-2 flex gap-0.5">
						{#each { length: 5 } as _, i}
							<span class={i < review.score ? 'text-yellow-400' : 'text-slate-600'}>★</span>
						{/each}
					</div>
					{#if review.details}
						<p class="text-sm text-slate-300">{review.details}</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
