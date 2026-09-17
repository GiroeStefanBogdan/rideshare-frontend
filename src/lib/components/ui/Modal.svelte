<script lang="ts">
	import { tick } from 'svelte';

	let {
		show = $bindable(false),
		label = 'Dialog',
		children
	}: { show?: boolean; label?: string; children: import('svelte').Snippet } = $props();
	let dialog = $state<HTMLDivElement>();
	let previouslyFocused: HTMLElement | null = null;

	$effect(() => {
		if (show) {
			previouslyFocused = document.activeElement as HTMLElement | null;
			void tick().then(() => dialog?.focus());
		} else if (previouslyFocused) {
			previouslyFocused.focus();
			previouslyFocused = null;
		}
	});

	function close() {
		show = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
			return;
		}
		if (event.key !== 'Tab') return;
		if (!dialog) return;
		const focusable = [
			...dialog.querySelectorAll<HTMLElement>(
				'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
		].filter((element) => !element.hasAttribute('disabled'));
		if (!focusable.length) return;
		const first = focusable[0];
		const last = focusable.at(-1)!;
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			aria-label="Close dialog"
			onclick={close}
		></button>
		<div
			bind:this={dialog}
			role="dialog"
			aria-modal="true"
			aria-label={label}
			tabindex="-1"
			onkeydown={handleKeydown}
			class="border-heritage relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border bg-white p-6 shadow-md outline-none"
		>
			{@render children?.()}
		</div>
	</div>
{/if}
