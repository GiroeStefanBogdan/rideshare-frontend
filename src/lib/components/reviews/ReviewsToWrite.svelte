<script lang="ts">
	import type { ReviewEligibility } from '$lib/types/review';
	import ReviewForm from '$lib/components/reviews/ReviewForm.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { eligibility, onChanged }: { eligibility: ReviewEligibility[]; onChanged?: () => void } =
		$props();

	const writable = $derived(
		eligibility.filter((entry) => entry.canSubmit && !dismissed[dismissalKey(entry)])
	);
	let editing = $state<number | null>(null);
	let fading = $state<number | null>(null);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let dismissed = $state<Record<string, boolean>>({});
	// Target of the review just saved, kept outside the writable filter so the
	// confirmation stays visible even once the dismissal hides the live entry.
	let savedConfirmation = $state<number | null>(null);

	const DISMISSED_STORAGE_KEY = 'reviews.dismissed.v1';

	function dismissalKey(entry: ReviewEligibility): string {
		return `${entry.targetUserId}:${entry.dropoffAt ?? entry.rideId}`;
	}

	function loadDismissed(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
			if (raw) dismissed = JSON.parse(raw) as Record<string, boolean>;
		} catch {
			dismissed = {};
		}
	}

	function persistDismissed(key: string): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const next = { ...dismissed, [key]: true };
			// Keep storage bounded; drop oldest keys first.
			const keys = Object.keys(next);
			if (keys.length > 200) {
				for (const old of keys.slice(0, keys.length - 200)) delete next[old];
			}
			localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(next));
			dismissed = next;
		} catch {
			dismissed = { ...dismissed, [key]: true };
		}
	}

	function clearSaveTimer(): void {
		if (saveTimer !== null) {
			clearTimeout(saveTimer);
			saveTimer = null;
		}
	}

	function handleSubmitted(entry: ReviewEligibility): void {
		clearSaveTimer();
		editing = null;
		fading = null;
		savedConfirmation = entry.targetUserId;
		// Let the confirmation render first, then fade it out over the final
		// second. The dismissal is keyed to this exact ride cycle, so neither
		// the fade-out nor a later refresh can bring the submitted entry back.
		persistDismissed(dismissalKey(entry));
		saveTimer = setTimeout(() => {
			fading = entry.targetUserId;
			saveTimer = setTimeout(() => {
				savedConfirmation = null;
				fading = null;
				saveTimer = null;
				onChanged?.();
			}, 1000);
		}, 2000);
	}

	$effect(() => {
		loadDismissed();
		return () => clearSaveTimer();
	});
</script>

<section
	class="border-heritage rounded-lg border bg-white p-6 shadow-md"
	data-to-write-count={writable.length}
>
	<h2 class="text-charcoal mb-4 text-2xl font-semibold">{i18n.t('reviews.toWrite')}</h2>

	<!-- Confirmation sits outside the writable filter: once the dismissal is written the saved
		entry is already gone from the list, but the user must still see that the review landed. -->
	{#if savedConfirmation}
		<p
			class="bg-voronet/10 text-charcoal mb-3 rounded-lg p-4 text-base font-semibold transition-opacity duration-1000 {fading !==
			null
				? 'opacity-0'
				: 'opacity-100'}"
			role="status"
		>
			{i18n.t('reviews.saved')}
		</p>
	{/if}

	{#if writable.length === 0}
		{#if !savedConfirmation}
			<p class="bg-heritage text-charcoal rounded-lg p-4 text-base" role="status">
				{i18n.t('reviews.nothingToWrite')}
			</p>
		{/if}
	{:else}
		<ul class="flex flex-col gap-3">
			{#each writable as entry (entry.targetUserId)}
				<li>
					{#if editing === entry.targetUserId}
						<ReviewForm
							eligibility={entry}
							onSubmitted={() => handleSubmitted(entry)}
							onCancel={() => (editing = null)}
						/>
					{:else}
						<div
							class="border-heritage flex items-center justify-between gap-3 rounded-lg border p-3"
						>
							<div>
								<p class="text-charcoal text-sm font-semibold">{entry.targetName}</p>
								<p class="text-charcoal text-xs">
									{entry.role === 'DRIVER'
										? i18n.t('reviews.reviewingPassenger')
										: i18n.t('reviews.reviewingDriver')}
								</p>
							</div>
							<button
								type="button"
								class="bg-voronet rounded-lg px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
								onclick={() => (editing = entry.targetUserId)}
							>
								{entry.existingReviewId ? i18n.t('reviews.update') : i18n.t('reviews.write')}
							</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
