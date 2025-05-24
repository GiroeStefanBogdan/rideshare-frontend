<script lang="ts">
	let { form } = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirm = $state('');
	let newsletter = $state(true);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 dark:from-slate-900 dark:to-slate-800"
>
	<div
		class="animate-fade-in w-full max-w-md rounded-2xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-lg sm:p-10 dark:border-white/20 dark:bg-white/10"
	>
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white">
				Create your account
			</h1>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-300">Sign up to access the dashboard</p>
		</div>

		{#if form?.error}
			<p class="mb-5 rounded border border-red-300 bg-red-100 p-3 text-center text-sm text-red-700">
				{form.error}
			</p>
		{/if}

		<form method="POST" class="space-y-5">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Full Name</label
				>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm transition focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
				/>
			</div>

			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Email address</label
				>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					autocomplete="email"
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm transition focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
				/>
			</div>

			<div>
				<label
					for="password"
					class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label
				>
				<div class="relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						required
						class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-12 text-gray-800 shadow-sm transition focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
					/>
					<button
						type="button"
						class="absolute inset-y-0 right-3 text-sm text-blue-500 hover:underline"
						onclick={() => (showPassword = !showPassword)}
					>
						{showPassword ? 'Hide' : 'Show'}
					</button>
				</div>
			</div>

			<div>
				<label for="confirm" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Confirm Password</label
				>
				<div class="relative">
					<input
						id="confirm"
						type={showConfirmPassword ? 'text' : 'password'}
						bind:value={confirm}
						required
						class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-12 text-gray-800 shadow-sm transition focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
					/>
					<!-- Optional: a second toggle button -->
					<button
						type="button"
						class="absolute inset-y-0 right-3 text-sm text-blue-500 hover:underline"
						onclick={() => (showConfirmPassword = !showConfirmPassword)}
					>
						{showConfirmPassword ? 'Hide' : 'Show'}
					</button>
				</div>
			</div>

			<div class="flex items-center text-sm">
				<input
					id="newsletter"
					type="checkbox"
					bind:checked={newsletter}
					class="form-checkbox mr-2 border-gray-300 text-blue-600 dark:border-gray-600"
				/>
				<label for="newsletter">Subscribe to our newsletter</label>
			</div>

			<button
				type="submit"
				class="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-2 font-semibold text-white shadow-lg transition duration-200 hover:scale-[1.01] hover:from-purple-700 hover:to-indigo-700"
			>
				Create Account
			</button>

			<p class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
				Already have an account?
				<a href="/login" class="text-blue-500 underline hover:text-blue-600">Login here</a>
			</p>
		</form>
	</div>
</div>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.animate-fade-in {
		animation: fade-in 0.5s ease-out both;
	}
</style>
