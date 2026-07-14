<script lang="ts">
	import { i18n } from '$lib/stores/i18n.svelte';
	import OfferRideForm from '$lib/components/publish/OfferRideForm.svelte';
</script>

<section class="folk-pattern-bg border-primary/5 relative overflow-hidden border-b pt-16 pb-20">
	<div class="relative z-10 mx-auto max-w-4xl px-8">
		<div class="mb-10">
			<div class="mb-4 inline-flex items-center gap-2">
				<div class="bg-primary/30 h-px w-8"></div>
				<p class="font-label text-primary text-[0.6875rem] font-bold tracking-[0.3em] uppercase">
					{i18n.t('publish.tagline')}
				</p>
			</div>
			<h1
				class="font-headline text-primary mb-4 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl"
			>
				{i18n.t('publish.title')}
			</h1>
			<p class="text-secondary font-body max-w-xl text-lg">
				{i18n.t('publish.description')}
			</p>
		</div>

		<OfferRideForm />
	</div>
</section>
