<script lang="ts">
	import PlaceholderPage from '$lib/components/ui/PlaceholderPage.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
</script>

<main class="bg-soft-white min-h-screen">
	<PlaceholderPage
		title={i18n.t('pages.forgotTitle')}
		message={i18n.t('pages.forgotTodo')}
		backHref="/login"
		backLabel={i18n.t('pages.backToLogin')}
	/>
</main>
