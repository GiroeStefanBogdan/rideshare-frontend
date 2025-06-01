<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let remember = $state(false);
	let error = $state('');

	async function handleLogin(event: Event) {
		event.preventDefault();

		const res = await fetch('http://localhost:8080/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include', // 🔐 Accepts cookie from server
			body: JSON.stringify({
				email,
				password
			})
		});
		if(res.ok){
			goto('/dashboard');
		} else {
			error = 'Invalid email or password';
		}
	}


	async function handleGoogleLogin(event: Event) {
		event.preventDefault();
		const res = await fetch('http://localhost:8080/oauth2/authorization/google', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include', // 🔐 Accepts cookie from server
		});
		if (res.ok) {
			const url = await res.text();
			// TODO: Redirect to dashboard if sucessful
			
		} else {
			error = 'Google login failed';
		}
	}

</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 dark:from-slate-900 dark:to-slate-800"
>
	<div
		class="animate-fade-in w-full max-w-md rounded-2xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-lg sm:p-10 dark:border-white/20 dark:bg-white/10"
	>
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white">
				Login to your dashboard
			</h1>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-300">Secure and stylish ✨</p>
		</div>

		<!-- Error -->
		{#if error}
			<p class="mb-5 rounded border border-red-300 bg-red-100 p-3 text-center text-sm text-red-700">
				{error}
			</p>
		{/if}

		<!-- Form -->
		<form onsubmit={handleLogin}>
			<!-- Email -->
			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
					Email address
				</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					autocomplete="email"
					placeholder="email"
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
				/>
			</div>

			<!-- Password -->
			<div>
				<label
					for="password"
					class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					Password
				</label>
				<div class="relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						required
						autocomplete="current-password"
						placeholder="password"
						class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-12 text-gray-800 shadow-sm transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
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

			<!-- Remember me / Forgot password -->
			<div class="flex items-center justify-between text-sm">
				<label class="flex items-center gap-2 text-gray-700 dark:text-gray-300">
					<input
						type="checkbox"
						bind:checked={remember}
						class="form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 dark:border-gray-600"
					/>
					<span>Remember me</span>
				</label>
				<a href="#" class="text-blue-500 hover:underline">Forgot password?</a>
			</div>

			 <!-- Google Login Button -->
      <button
        type="button"
        onclick={handleGoogleLogin}
        class="mt-4 mb-4 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-600 dark:bg-slate-800 dark:text-white hover:dark:bg-slate-700"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="h-5 w-5" />
        Sign in with Google
      </button>

			<!-- Submit -->
			<button
				type="submit"
				class="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2 font-semibold text-white shadow-lg transition duration-200 hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700"
			>
				Sign in
			</button>
		</form>

		<!-- Footer -->
		<p class="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
			By logging in, you agree to our
			<a href="#" class="underline hover:text-blue-500">terms of service</a>.
		</p>

		<p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
			Don't have an account?
			<a href="/register" class="font-medium text-blue-500 hover:underline">Sign up here</a>
		</p>
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
		animation: fade-in 0.4s ease-out both;
	}
	</style>
