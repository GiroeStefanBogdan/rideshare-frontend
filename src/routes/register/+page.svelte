<script lang="ts">
	import { goto } from '$app/navigation';

	let name = '';
	let email = '';
	let password = '';
	let birthday = '';
	let phoneNumber = '';
	let gender = '';
	let confirm = '';
	let newsletter = true;
	let showPassword = false;
	let showConfirmPassword = false;
	let error = '';
	let fieldErrors: Record<string, string> = {};

	// Derived value for password match
	$: passwordsMatch = password === confirm;

	async function handleRegister(event: Event) {
		event.preventDefault();

		// Only proceed if there is no error
		if (!error) {
			const res = await fetch('http://localhost:8080/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					password,
					birthday,
					phoneNumber,
					gender
				})
			});

			if (res.ok) {
				goto('/login');
			} else {
				if (res.headers.get('Content-Type')?.includes('application/json')) {
					const data = await res.json();

					if (typeof data === 'object') {
						fieldErrors = data;
						console.log('Field errors:', fieldErrors);
					}
				}
				error = 'Invalid email or password';
			}
		}
	}
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

		<form onsubmit={handleRegister} class="space-y-5">
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

				{#if fieldErrors.email}
					<p class="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
				{/if}
			</div>

			<div>
				<label for="gender" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Gender</label
				>
				<select
					id="gender"
					bind:value={gender}
					required
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm transition focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
				>
					<option value="M">Male</option>
					<option value="F">Female</option>
				</select>
			</div>
			<div>
				<label
					for="birthday"
					class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Birthday</label
				>
				<input
					id="birthday"
					type="date"
					bind:value={birthday}
					required
					class="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm transition focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white [&::-webkit-calendar-picker-indicator]:invert"
				/>
				{#if fieldErrors.birthday}
					<p class="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.birthday}</p>
				{/if}
			</div>

			<div>
				<label
					for="phoneNumber"
					class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Phone Number</label
				>
				<input
					id="phoneNumber"
					type="tel"
					bind:value={phoneNumber}
					required
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 shadow-sm transition focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
				/>
				{#if fieldErrors.phoneNumber}
					<p class="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.phoneNumber}</p>
				{/if}
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
						type="submit"
						class="absolute inset-y-0 right-3 text-sm text-blue-500 hover:underline"
						onclick={() => (showPassword = !showPassword)}
					>
						{showPassword ? 'Hide' : 'Show'}
					</button>
				</div>
				{#if fieldErrors.password}
					<p class="mt-2 text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
				{/if}
			</div>

			<div>
				<label for="confirm" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Confirm Password</label
				>
				<div class="relative mb-9">
					<input
						id="confirm"
						type={showConfirmPassword ? 'text' : 'password'}
						bind:value={confirm}
						required
						class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-12 text-gray-800 shadow-sm transition focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-slate-800 dark:text-white"
					/>
					{#if !passwordsMatch}
						<p class="absolute top-full left-0 mt-1 text-sm text-red-600 dark:text-red-400">
							Passwords do not match
						</p>
					{/if}
					<!-- toggle button for confirm password -->
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
				disabled={!passwordsMatch}
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
