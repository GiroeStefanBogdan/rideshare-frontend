<script lang="ts">
	let { data } = $props();
	let { email }: { email: string | null } = data;

	console.log('📥 Received email:', email);
</script>

<h1>Dashboard</h1>
<p>Email: {email}</p>

{#if email}
	<p style="color: green">✅ Authenticated as {email}</p>
{:else}
	<p style="color: red">❌ Not authenticated</p>
{/if}
