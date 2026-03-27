<script lang="ts">
	import type { UserCar } from '$lib/types/user';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { cars }: { cars: UserCar[] } = $props();
</script>

<div
	class="bg-surface-container-lowest border-outline-variant/15 rounded-xl border p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)]"
>
	<div class="mb-5 flex items-center gap-3">
		<div class="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-lg">
			<span class="material-symbols-outlined text-primary-container">directions_car</span>
		</div>
		<h2 class="font-headline text-primary text-xl font-bold">{i18n.t('account.myCars')}</h2>
	</div>

	{#if cars.length === 0}
		<p class="font-body text-secondary text-sm">{i18n.t('account.noCars')}</p>
	{:else}
		<ul class="space-y-3">
			{#each cars as car (car.id)}
				<li class="bg-surface-container-low flex items-center justify-between rounded-lg px-4 py-3">
					<div class="flex items-center gap-3">
						<span class="material-symbols-outlined text-primary/50">directions_car</span>
						<div>
							<p class="font-headline text-on-surface font-bold">{car.brand} {car.model}</p>
							<p
								class="font-label text-secondary/70 text-[0.6875rem] font-bold tracking-widest uppercase"
							>
								{car.color}
							</p>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
