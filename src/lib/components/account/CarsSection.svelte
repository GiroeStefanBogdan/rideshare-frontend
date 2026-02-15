<script lang="ts">
	import type { UserCar } from '$lib/types/user';

	let { cars }: { cars: UserCar[] } = $props();
</script>

<div class="rounded-xl bg-slate-800 p-6 shadow">
	<h2 class="mb-4 text-xl font-semibold text-white">My Cars</h2>

	{#if cars.length === 0}
		<p class="text-sm text-slate-400">No cars registered yet.</p>
	{:else}
		<ul class="space-y-3">
			{#each cars as car (car.id)}
				<li class="flex items-center justify-between rounded-lg bg-slate-700 px-4 py-3">
					<div>
						<p class="font-medium text-white">{car.brand} {car.model}</p>
						<p class="text-sm text-slate-400">{car.color}</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
