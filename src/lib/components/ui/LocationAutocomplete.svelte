<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import { getLocations } from '$lib/api/locations.js';
	import type { LocationResult } from '$lib/types/location.js';

	let {
		id,
		placeholder,
		icon,
		label = '',
		value = $bindable(null)
	}: {
		id: string;
		placeholder: string;
		icon: string;
		label?: string;
		value?: LocationResult | null;
	} = $props();

	let query = $state('');
	let results = $state<LocationResult[]>([]);
	let loading = $state(false);
	let showDropdown = $state(false);
	let error = $state<string | null>(null);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let blurTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (value && query !== value.fullName) {
			query = value.fullName;
		}
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		value = null; // Clear selected value when typing

		clearTimeout(debounceTimer);
		if (!query.trim()) {
			results = [];
			showDropdown = false;
			return;
		}

		showDropdown = true;
		loading = true;
		error = null;

		debounceTimer = setTimeout(async () => {
			try {
				results = await getLocations(query);
			} catch (err) {
				error = i18n.t('search.loadError');
			} finally {
				loading = false;
			}
		}, 300);
	}

	function selectLocation(loc: LocationResult) {
		if (blurTimer) clearTimeout(blurTimer);
		value = loc;
		query = loc.fullName;
		showDropdown = false;
	}

	function handleBlur() {
		blurTimer = setTimeout(() => {
			showDropdown = false;
		}, 200);
	}

	function handleFocus() {
		if (blurTimer) clearTimeout(blurTimer);
		if (query) showDropdown = true;
	}
</script>

<div
	class="relative flex flex-1 flex-col rounded-lg px-6 py-4 transition-all focus-within:bg-white focus-within:shadow-sm {!showDropdown
		? 'bg-surface-container-low/50'
		: 'bg-white'}"
>
	{#if label}
		<label
			for={id}
			class="font-label text-secondary/70 mb-1 text-[0.6875rem] font-bold tracking-widest uppercase"
			>{label}</label
		>
	{/if}
	<div class="flex items-center gap-3">
		<span class="material-symbols-outlined text-primary/70" data-icon={icon}>{icon}</span>
		<input
			{id}
			class="placeholder:text-outline-variant/60 w-full border-none bg-transparent p-0 text-lg font-bold focus:ring-0"
			{placeholder}
			type="text"
			autocomplete="off"
			bind:value={query}
			oninput={handleInput}
			onfocus={handleFocus}
			onblur={handleBlur}
		/>
	</div>

	{#if showDropdown && (loading || results.length > 0 || error || (!loading && query.trim() && results.length === 0))}
		<div
			class="glass-panel ia-border-accent absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border bg-white shadow-lg transition-all"
		>
			{#if loading}
				<div class="text-secondary p-4 text-center text-sm">
					{i18n.t('search.searching')}
				</div>
			{:else if error}
				<div class="p-4 text-center text-sm text-red-500">
					{error}
				</div>
			{:else if results.length === 0}
				<div class="text-secondary p-4 text-center text-sm">
					{i18n.t('search.noResults')}
				</div>
			{:else}
				<ul class="max-h-60 overflow-y-auto py-2">
					{#each results as loc (loc.id)}
						<li>
							<button
								class="hover:bg-surface-container-low/60 focus:bg-surface-container-low/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus:outline-none"
								onpointerdown={(event) => {
									event.preventDefault();
									selectLocation(loc);
								}}
								onclick={() => selectLocation(loc)}
								type="button"
							>
								<span
									class="material-symbols-outlined text-primary/60 text-xl"
									data-icon={loc.type === 'STREET' ? 'add_road' : 'location_city'}
								>
									{loc.type === 'STREET' ? 'add_road' : 'location_city'}
								</span>
								<span class="flex flex-col">
									<span class="font-headline text-primary font-bold">{loc.name}</span>
									<span class="text-secondary/80 text-xs">{loc.fullName}</span>
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>
