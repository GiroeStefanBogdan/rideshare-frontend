<script lang="ts">
	import { resolve } from '$app/paths';
	let {
		title,
		message,
		backHref,
		backLabel
	}: { title: string; message: string; backHref?: '/login'; backLabel?: string } = $props();
</script>

<section class="folk-pattern-bg px-4 py-16">
	<div class="border-heritage mx-auto max-w-3xl rounded-lg border bg-white p-6 shadow-md md:p-10">
		<p class="text-voronet text-xs font-semibold tracking-widest uppercase">DrumBun</p>
		<h1 class="text-charcoal mt-3 text-4xl font-bold tracking-tight">{title}</h1>
		<p class="text-charcoal mt-6 text-base leading-relaxed">{message}</p>
		{#if backHref && backLabel}
			<a
				href={resolve(backHref)}
				class="bg-voronet mt-8 inline-flex rounded-lg px-6 py-3 font-semibold text-white transition-opacity duration-150 hover:opacity-90"
			>
				{backLabel}
			</a>
		{/if}
	</div>
</section>
