<script lang="ts">
	import { tick } from 'svelte';
	import { i18n } from '$lib/stores/i18n.svelte';

	let {
		show = $bindable(false),
		title = '',
		message = '',
		confirmText = '',
		cancelText = '',
		onConfirm = () => {},
		onCancel = () => {}
	} = $props();
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

	function cancel() {
		onCancel();
		show = false;
	}

	function confirm() {
		onConfirm();
		show = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') cancel();
		if (event.key !== 'Tab') return;
		if (!dialog) return;
		const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
		if (!buttons.length) return;
		if (event.shiftKey && document.activeElement === buttons[0]) {
			event.preventDefault();
			buttons.at(-1)?.focus();
		} else if (!event.shiftKey && document.activeElement === buttons.at(-1)) {
			event.preventDefault();
			buttons[0].focus();
		}
	}
</script>

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			aria-label={i18n.t('common.cancel')}
			onclick={cancel}
		></button>
		<div
			bind:this={dialog}
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="confirmation-title"
			aria-describedby="confirmation-message"
			tabindex="-1"
			onkeydown={handleKeydown}
			class="border-heritage relative w-full max-w-sm rounded-lg border bg-white p-6 shadow-md outline-none"
		>
			<div class="mb-4 flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-700">
					<span class="material-symbols-outlined" aria-hidden="true">warning</span>
				</div>
				<h2 id="confirmation-title" class="text-charcoal text-xl font-semibold">
					{title || i18n.t('common.confirm')}
				</h2>
			</div>
			<p id="confirmation-message" class="text-charcoal mb-6 text-base leading-relaxed">
				{message}
			</p>
			<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<button
					type="button"
					onclick={cancel}
					class="border-heritage text-charcoal hover:bg-heritage rounded-lg border px-4 py-3 font-semibold"
					>{cancelText || i18n.t('common.cancel')}</button
				>
				<button
					type="button"
					onclick={confirm}
					class="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:opacity-90"
					>{confirmText || i18n.t('common.delete')}</button
				>
			</div>
		</div>
	</div>
{/if}
