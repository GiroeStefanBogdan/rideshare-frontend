<script lang="ts">
	let { data } = $props();
	let { email }: { email: string | null } = data;
</script>

<div class="space-y-6">
	<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>

	{#if email}
		<div
			class="rounded-xl border border-slate-700 bg-slate-800/50 p-6 shadow-lg backdrop-blur-sm"
		>
			<p class="text-sm text-slate-400">Signed in as</p>
			<p class="mt-1 text-lg font-semibold text-white">{email}</p>
			<span
				class="mt-3 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400"
			>
				Authenticated
			</span>
		</div>
	{:else}
		<div class="rounded-xl border border-red-500/30 bg-red-500/10 p-6 shadow-lg">
			<p class="font-medium text-red-400">Not authenticated</p>
			<p class="mt-1 text-sm text-slate-400">
				Please <a href="/login" class="text-blue-400 underline hover:text-blue-300">log in</a> to
				access your dashboard.
			</p>
		</div>
	{/if}
</div>
