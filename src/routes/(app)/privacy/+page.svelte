<script lang="ts">
	import PlaceholderPage from '$lib/components/ui/PlaceholderPage.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';
</script>

<PlaceholderPage title={i18n.t('pages.privacyTitle')} message={i18n.t('pages.privacyTodo')} />
