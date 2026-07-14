<script lang="ts">
	import { resolve } from '$app/paths';
	import { i18n } from '$lib/stores/i18n.svelte';

	let open = $state(false);
	function close(): void {
		open = false;
	}
	$effect(() => {
		if (!open) return;
		const onPointerDown = (event: PointerEvent): void => {
			if (event.target instanceof Node && !(event.target as Element).closest('[data-account-menu]'))
				close();
		};
		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') close();
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	});
</script>

<div class="relative" data-account-menu>
	<button
		type="button"
		class="text-secondary hover:text-primary flex items-center transition-colors duration-300"
		aria-label={i18n.t('nav.account')}
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<span class="material-symbols-outlined text-2xl">account_circle</span>
	</button>
	{#if open}
		<div
			class="border-outline-variant/20 bg-surface absolute right-0 top-11 z-50 min-w-44 rounded-xl border p-2 shadow-xl"
			role="menu"
		>
			<a
				class="hover:bg-primary/5 text-secondary block rounded-lg px-3 py-2 text-sm font-semibold"
				href={resolve('/account')}
				role="menuitem"
				onclick={close}>{i18n.t('nav.profile')}</a
			>
			<a
				class="hover:bg-primary/5 text-secondary block rounded-lg px-3 py-2 text-sm font-semibold"
				href={resolve('/my-rides')}
				role="menuitem"
				onclick={close}>{i18n.t('nav.myRides')}</a
			>
		</div>
	{/if}
</div>
