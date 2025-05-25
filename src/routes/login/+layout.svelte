<script lang="ts">
	let { children } = $props();
	import '../../app.css';
	export const inheritLayouts = false;
</script>

{@render children()}
