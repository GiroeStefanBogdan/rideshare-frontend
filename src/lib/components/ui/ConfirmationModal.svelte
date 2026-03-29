<script lang="ts">
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

	function handleConfirm() {
		onConfirm();
		show = false;
	}

	function handleCancel() {
		onCancel();
		show = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		}
	}
</script>

{#if show}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" onkeydown={handleKeydown}>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={handleCancel}></div>

		<!-- Modal Container -->
		<div
			class="bg-surface-container-lowest border-outline-variant/20 relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl transition-all"
		>
			<div class="p-6">
				<!-- Header with Icon -->
				<div class="mb-4 flex items-center gap-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"
					>
						<span class="material-symbols-outlined text-2xl">warning</span>
					</div>
					<div>
						<h3 class="font-headline text-lg font-bold text-slate-900">
							{title || i18n.t('common.confirm')}
						</h3>
					</div>
				</div>

				<!-- Message -->
				<p class="mb-6 text-sm leading-relaxed text-slate-600">
					{message}
				</p>

				<!-- Actions -->
				<div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
					<button
						onclick={handleCancel}
						class="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 sm:flex-none"
					>
						{cancelText || i18n.t('common.cancel')}
					</button>
					<button
						onclick={handleConfirm}
						class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 sm:flex-none"
					>
						{confirmText || i18n.t('common.delete')}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
