<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';

	let { children } = $props();
</script>

<div class="relative">
	<div
		class="border-heritage absolute top-4 right-4 z-10 flex gap-1 rounded-md border bg-white p-1"
		aria-label={i18n.t('nav.language')}
	>
		<button
			type="button"
			class="rounded-md px-3 py-2 text-xs font-bold {i18n.lang === 'ro'
				? 'bg-voronet text-white'
				: 'text-charcoal hover:bg-heritage'}"
			onclick={() => i18n.setLang('ro')}
			aria-pressed={i18n.lang === 'ro'}>RO</button
		>
		<button
			type="button"
			class="rounded-md px-3 py-2 text-xs font-bold {i18n.lang === 'en'
				? 'bg-voronet text-white'
				: 'text-charcoal hover:bg-heritage'}"
			onclick={() => i18n.setLang('en')}
			aria-pressed={i18n.lang === 'en'}>EN</button
		>
	</div>
	{@render children()}
</div>
