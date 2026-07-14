<script lang="ts">
	import LocationAutocomplete from '$lib/components/ui/LocationAutocomplete.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
	import type { LocationResult } from '$lib/types/location.js';

	let {
		id,
		label,
		placeholder,
		icon,
		priceEditable = false,
		removable = false,
		onRemove,
		value = $bindable(null),
		price = $bindable(null)
	}: {
		id: string;
		label: string;
		placeholder: string;
		icon: string;
		priceEditable?: boolean;
		removable?: boolean;
		onRemove?: () => void;
		value?: LocationResult | null;
		price?: number | null;
	} = $props();
</script>

<div class="flex items-center gap-2">
	<div class="flex-1">
		<LocationAutocomplete {id} {label} {placeholder} {icon} bind:value />
	</div>
	<div class="bg-surface-container-low/50 flex shrink-0 flex-col items-center rounded-lg px-4 py-3">
		<span class="font-label text-secondary/70 text-[0.625rem] font-bold tracking-widest uppercase"
			>RON</span
		>
		{#if priceEditable}
			<input
				id="{id}-price"
				type="number"
				min="1"
				max="32767"
				step="1"
				bind:value={price}
				class="text-primary w-16 border-none bg-transparent p-0 text-center text-lg font-bold focus:ring-0"
			/>
		{:else}
			<span class="text-primary text-lg font-bold">{price}</span>
		{/if}
	</div>
	{#if removable}
		<button
			type="button"
			onclick={onRemove}
			aria-label={i18n.t('publish.removeStop')}
			class="hover:bg-error/10 text-error flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors"
		>
			<span class="material-symbols-outlined" data-icon="close">close</span>
		</button>
	{/if}
</div>
