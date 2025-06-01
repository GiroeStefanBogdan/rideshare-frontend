<script>
	let { children } = $props();
	let menuOpen = $state(false);
</script>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-white">
	<!-- Header -->
	<header
		class="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/90 shadow-sm backdrop-blur"
	>
		<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
			<a href="/" class="text-2xl font-bold tracking-tight text-blue-400">BlaClone</a>

			<!-- Desktop nav -->
			<nav class="hidden items-center gap-6 font-medium md:flex">
				<a href="/rides" class="transition hover:text-blue-400">Find a Ride</a>
				<a href="/publish" class="transition hover:text-blue-400">Offer a Ride</a>
				<a href="/account" class="transition hover:text-blue-400">My Account</a>
				<a
					href="/login"
					class="ml-2 rounded-md border border-blue-500 px-4 py-1.5 text-blue-400 transition hover:bg-blue-500 hover:text-white"
				>
					Login
				</a>
			</nav>

			<!-- Mobile burger -->
			<button
				class="text-2xl text-blue-400 md:hidden"
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="Toggle menu"
			>
				☰
			</button>
		</div>

		<!-- Mobile nav -->
		{#if menuOpen}
			<div
				class="space-y-2 border-t border-slate-800 bg-slate-900 px-4 pb-4 text-sm font-medium md:hidden"
			>
				<a href="/rides" class="block py-2 hover:text-blue-400">Find a Ride</a>
				<a href="/publish" class="block py-2 hover:text-blue-400">Offer a Ride</a>
				<a href="/account" class="block py-2 hover:text-blue-400">My Account</a>
				<a
					href="/login"
					class="block rounded-md border border-blue-500 py-2 text-center text-blue-400 hover:bg-blue-500 hover:text-white"
				>
					Login
				</a>
			</div>
		{/if}
	</header>

	<!-- Page content -->
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-slate-800 bg-slate-900 py-6 text-center text-sm text-slate-400">
		&copy; {new Date().getFullYear()} BlaClone. Made for shared journeys.
	</footer>
</div>
