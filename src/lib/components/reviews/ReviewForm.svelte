<script lang="ts">
	import { submitReview } from '$lib/api/reviews';
	import type { ReviewEligibility } from '$lib/types/review';
	import { i18n } from '$lib/stores/i18n.svelte';

	let {
		eligibility,
		onSubmitted,
		onCancel
	}: {
		eligibility: ReviewEligibility;
		onSubmitted: () => void;
		onCancel: () => void;
	} = $props();

	let score = $state(0);
	let details = $state('');
	let submitting = $state(false);
	let error = $state('');
	let touchedSubmit = $state(false);

	const roleLabel = $derived(
		eligibility.role === 'DRIVER'
			? i18n.t('reviews.reviewingPassenger')
			: i18n.t('reviews.reviewingDriver')
	);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		touchedSubmit = true;
		if (score < 1) {
			error = i18n.t('reviews.scoreRequired');
			return;
		}

		submitting = true;
		error = '';
		try {
			await submitReview({
				targetUserId: eligibility.targetUserId,
				score,
				details: details.trim() === '' ? null : details.trim()
			});
			onSubmitted();
		} catch (err) {
			error = err instanceof Error ? err.message : i18n.t('reviews.submitFailed');
		} finally {
			submitting = false;
		}
	}
</script>

<form class="border-heritage rounded-lg border bg-white p-4" onsubmit={handleSubmit}>
	<h3 class="text-charcoal mb-1 text-base font-semibold">
		{eligibility.existingReviewId ? i18n.t('reviews.updateTitle') : i18n.t('reviews.writeTitle')} — {eligibility.targetName}
	</h3>
	<p class="text-charcoal mb-3 text-xs">{roleLabel}</p>

	<fieldset class="mb-3">
		<legend class="text-charcoal mb-1 text-sm font-semibold">{i18n.t('reviews.scoreLabel')}</legend>
		<div class="flex items-center gap-1">
			{#each [1, 2, 3, 4, 5] as value (value)}
				<button
					type="button"
					aria-label="{value}/5"
					aria-pressed={score === value}
					class="material-symbols-outlined text-[24px] {value <= score
						? 'text-voronet'
						: 'text-heritage'}"
					onclick={() => (score = value)}>star</button
				>
			{/each}
		</div>
	</fieldset>

	<label class="text-charcoal mb-1 block text-sm font-semibold" for="review-details">
		{i18n.t('reviews.commentLabel')}
	</label>
	<textarea
		id="review-details"
		class="border-heritage text-charcoal mb-3 w-full rounded-lg border p-3 text-base"
		rows="3"
		maxlength="1000"
		bind:value={details}
		placeholder={i18n.t('reviews.commentPlaceholder')}></textarea>

	{#if error}
		<p class="mb-3 text-sm font-semibold text-red-600" role="alert">{error}</p>
	{:else if touchedSubmit && score < 1}
		<p class="mb-3 text-sm text-red-600" role="alert">{i18n.t('reviews.scoreRequired')}</p>
	{/if}

	<div class="flex items-center gap-2">
		<button
			type="submit"
			disabled={submitting}
			class="bg-voronet rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
		>
			{i18n.t('reviews.save')}
		</button>
		<button
			type="button"
			class="text-charcoal rounded-lg px-4 py-2 text-sm font-semibold"
			onclick={onCancel}
		>
			{i18n.t('reviews.cancel')}
		</button>
	</div>
</form>
