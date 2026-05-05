<script lang="ts">
	let {
		show = $bindable(false),
		children
	}: { show?: boolean; children: import('svelte').Snippet } = $props();

	function handleBackdrop() {
		show = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') show = false;
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" onkeydown={handleKeydown}>
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick={handleBackdrop}></div>
		<div
			class="bg-surface-container-lowest border-outline-variant/20 relative w-full max-w-lg overflow-y-auto rounded-2xl border p-6 shadow-2xl transition-all"
		>
			{@render children?.()}
		</div>
	</div>
{/if}
