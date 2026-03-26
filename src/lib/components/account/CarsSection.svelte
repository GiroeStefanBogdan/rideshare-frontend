<script lang="ts">
  import type { UserCar } from '$lib/types/user';
  import { i18n } from '$lib/stores/i18n.svelte';

  let { cars }: { cars: UserCar[] } = $props();
</script>

<div class="rounded-xl bg-surface-container-lowest p-6 shadow-[0_8px_40px_rgba(0,32,104,0.06)] border border-outline-variant/15">
  <div class="mb-5 flex items-center gap-3">
    <div class="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
      <span class="material-symbols-outlined text-primary-container">directions_car</span>
    </div>
    <h2 class="font-headline text-xl font-bold text-primary">{i18n.t('account.myCars')}</h2>
  </div>

  {#if cars.length === 0}
    <p class="font-body text-sm text-secondary">{i18n.t('account.noCars')}</p>
  {:else}
    <ul class="space-y-3">
      {#each cars as car (car.id)}
        <li class="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-3">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary/50">directions_car</span>
            <div>
              <p class="font-headline font-bold text-on-surface">{car.brand} {car.model}</p>
              <p class="font-label text-[0.6875rem] font-bold tracking-widest text-secondary/70 uppercase">{car.color}</p>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
