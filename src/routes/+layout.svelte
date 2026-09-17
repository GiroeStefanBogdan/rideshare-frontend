<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { children } = $props();

	onMount(() => i18n.init());
</script>

{@render children()}
