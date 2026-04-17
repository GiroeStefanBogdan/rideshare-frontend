<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
	import { env } from '$env/dynamic/public';
	import { authStore } from '$lib/stores/auth.svelte';
	import { fetchChatKey } from '$lib/api/chat';
	import { ApiError } from '$lib/api/client';
	import { importAesKey, encryptMessage, decryptMessage } from '$lib/crypto';
	import type { ChatMessage, IncomingChatFrame } from '$lib/types/chat';

	const WS_URL = (env.PUBLIC_API_URL ?? 'http://localhost:8080').replace(/^http/, 'ws') + '/ws';
	const RIDE_ID = 42;

	/** Mock participant list shown in the info panel so the user knows which accounts to use. */
	const MOCK_PARTICIPANTS = [
		'driver@blablacar.test',
		'passenger1@blablacar.test',
		'passenger2@blablacar.test'
	];

	type ConnectionStatus = 'disconnected' | 'fetching-key' | 'connecting' | 'connected' | 'error';

	let status = $state<ConnectionStatus>('disconnected');
	let messages = $state<ChatMessage[]>([]);
	let inputText = $state('');
	let errorMessage = $state('');
	let nextId = 0;
	let chatEl = $state<HTMLDivElement | null>(null);

	let cryptoKey: CryptoKey | null = null;
	let client: Client | null = null;
	let subscription: StompSubscription | null = null;

	const myEmail = $derived(authStore.email);

	function scrollToBottom() {
		setTimeout(() => chatEl?.scrollTo({ top: chatEl.scrollHeight, behavior: 'smooth' }), 30);
	}

	async function connect() {
		if (client?.active) return;
		errorMessage = '';

		// ── Step 1: verify the caller is a ride participant and obtain the AES key ──
		status = 'fetching-key';
		try {
			const { key } = await fetchChatKey(RIDE_ID);
			cryptoKey = await importAesKey(key);
		} catch (err) {
			if (err instanceof ApiError && err.status === 403) {
				errorMessage = 'Access denied — your account is not a participant of this ride.';
			} else {
				errorMessage = err instanceof Error ? `Key fetch failed: ${err.message}` : 'Key fetch failed';
			}
			status = 'error';
			return;
		}

		// ── Step 2: open the encrypted WebSocket channel ──
		// The JWT cookie is sent automatically with the HTTP upgrade request;
		// Spring Security authenticates it via JwtFilter before the handshake completes.
		status = 'connecting';
		client = new Client({
			brokerURL: WS_URL,
			reconnectDelay: 0,
			onConnect: () => {
				status = 'connected';
				subscription = client!.subscribe(`/topic/ride.${RIDE_ID}`, handleFrame);
			},
			onStompError: (frame) => {
				const raw = frame.headers['message'] ?? 'STOMP error';
				errorMessage = raw.toLowerCase().includes('access denied') || raw.toLowerCase().includes('not a participant')
					? 'Server rejected the connection — are you a participant of this ride?'
					: raw;
				status = 'error';
			},
			onWebSocketError: () => {
				errorMessage = `Cannot reach ${WS_URL}`;
				status = 'error';
			},
			onDisconnect: () => {
				// Only reset to disconnected on clean/unexpected disconnect.
				// If we already have an error, keep the error state visible.
				if (status !== 'error') {
					status = 'disconnected';
				}
			}
		});

		client.activate();
	}

	async function handleFrame(frame: IMessage) {
		if (!cryptoKey) return;
		try {
			const data = JSON.parse(frame.body) as IncomingChatFrame;
			const plaintext = await decryptMessage(cryptoKey, data.ciphertext);
			messages = [
				...messages,
				{
					id: nextId++,
					sender: data.sender,
					plaintext,
					timestamp: new Date(data.timestamp).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit'
					}),
					mine: data.sender === myEmail
				}
			];
			scrollToBottom();
		} catch {
			// Frame could not be decrypted — wrong key or tampered payload; silently ignore.
		}
	}

	async function sendMessage() {
		const text = inputText.trim();
		if (!text || !client?.active || !cryptoKey) return;

		try {
			const ciphertext = await encryptMessage(cryptoKey, text);
			client.publish({
				destination: `/app/ride.${RIDE_ID}.chat`,
				body: JSON.stringify({ ciphertext })
			});
			inputText = '';
		} catch {
			errorMessage = 'Encryption failed — message not sent.';
		}
	}

	function disconnect() {
		subscription?.unsubscribe();
		subscription = null;
		client?.deactivate();
		client = null;
		cryptoKey = null;
		errorMessage = '';
		status = 'disconnected';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	onDestroy(() => {
		subscription?.unsubscribe();
		client?.deactivate();
	});
</script>

<div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
	<div class="w-full max-w-md flex flex-col gap-3">

		<!-- Info panel: shows who is logged in and which accounts are allowed -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 text-xs space-y-1.5">
			<p class="text-gray-500">
				Logged in as
				<span class="font-mono font-semibold text-gray-800">{myEmail || '(unknown)'}</span>
			</p>
			<p class="text-gray-400">Allowed accounts for ride #{RIDE_ID}:</p>
			<ul class="ml-2 space-y-0.5">
				{#each MOCK_PARTICIPANTS as email}
					<li class="font-mono {email === myEmail ? 'text-green-600 font-semibold' : 'text-gray-400'}">
						{email === myEmail ? '✓ ' : '  '}{email}
					</li>
				{/each}
			</ul>
		</div>

		<!-- Chat card -->
		<div class="w-full bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden" style="height: 600px;">

			<!-- Header -->
			<div class="bg-blue-600 px-4 py-3 flex items-center gap-3">
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<span class="text-white font-semibold text-sm">Ride #{RIDE_ID}</span>
						<span class="inline-block size-2 rounded-full flex-shrink-0
							{status === 'connected'                               ? 'bg-green-400'  :
							 status === 'connecting' || status === 'fetching-key' ? 'bg-yellow-400' :
							 status === 'error'                                   ? 'bg-red-400'    : 'bg-gray-400'}">
						</span>
					</div>
					<p class="text-blue-200 text-xs mt-0.5 truncate">
						{status === 'connected'    ? 'Connected · AES-256-GCM encrypted'   :
						 status === 'fetching-key' ? 'Verifying ride access…'              :
						 status === 'connecting'   ? 'Opening encrypted channel…'          :
						 status === 'error'        ? 'Connection error'                    : 'Disconnected'}
					</p>
				</div>
				{#if status === 'connected'}
					<button
						onclick={disconnect}
						class="px-3 py-1.5 text-xs font-medium text-blue-200 hover:text-white transition-colors flex-shrink-0"
					>
						Disconnect
					</button>
				{/if}
			</div>

			<!-- Ride info bar -->
			<div class="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2 text-xs text-blue-700">
				<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
				</svg>
				<span>Bucharest → Cluj-Napoca · Today, 14:30</span>
				<span class="ml-auto flex items-center gap-1 text-blue-500 font-medium">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-3" viewBox="0 0 24 24" fill="currentColor">
						<path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd"/>
					</svg>
					AES-256-GCM
				</span>
			</div>

			<!-- Error banner -->
			{#if errorMessage}
				<div class="bg-red-50 border-b border-red-100 px-4 py-2.5 flex items-start gap-2 text-xs text-red-600">
					<svg xmlns="http://www.w3.org/2000/svg" class="size-4 flex-shrink-0 mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<!-- Messages -->
			<div bind:this={chatEl} class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">

				{#if status === 'disconnected' || status === 'error'}
					<div class="flex flex-col items-center justify-center h-full gap-4 text-center">
						<div class="size-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">🔒</div>
						<div>
							<p class="font-semibold text-gray-700">Encrypted ride chat</p>
							<p class="text-sm text-gray-400 mt-1">
								Messages are encrypted with AES-256-GCM before leaving your device.
								Only ride participants can read them.
							</p>
						</div>
						<button
							onclick={connect}
							class="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
						>
							Connect
						</button>
					</div>

				{:else if status === 'fetching-key' || status === 'connecting'}
					<div class="flex flex-col items-center justify-center h-full gap-3 text-center">
						<div class="size-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
						<p class="text-sm text-gray-400">
							{status === 'fetching-key' ? 'Verifying ride access…' : 'Opening encrypted channel…'}
						</p>
					</div>

				{:else if messages.length === 0}
					<div class="flex flex-col items-center justify-center h-full gap-3 text-center">
						<div class="size-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">💬</div>
						<div>
							<p class="font-semibold text-gray-700">Secure channel open</p>
							<p class="text-xs text-gray-400 mt-1">Send the first message</p>
						</div>
					</div>

				{:else}
					{#each messages as msg (msg.id)}
						<div class="flex gap-2 {msg.mine ? 'flex-row-reverse' : 'flex-row'}">
							<!-- Avatar: first letter of email -->
							<div class="size-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
								{msg.mine ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}">
								{msg.sender.charAt(0).toUpperCase()}
							</div>

							<div class="flex flex-col gap-0.5 max-w-[72%] {msg.mine ? 'items-end' : 'items-start'}">
								<span class="text-xs text-gray-400 px-1 truncate max-w-full">{msg.sender}</span>
								<div class="px-3.5 py-2.5 rounded-2xl text-sm leading-snug
									{msg.mine
										? 'bg-blue-600 text-white rounded-tr-sm'
										: 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'}">
									{msg.plaintext}
								</div>
								<span class="text-xs text-gray-300 px-1">{msg.timestamp}</span>
							</div>
						</div>
					{/each}
				{/if}

			</div>

			<!-- Input bar -->
			<div class="border-t border-gray-200 bg-white px-3 py-3 flex items-end gap-2">
				{#if status === 'connected'}
					<input
						type="text"
						bind:value={inputText}
						onkeydown={handleKeydown}
						placeholder="Message (encrypted before sending)…"
						class="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<button
						onclick={sendMessage}
						disabled={!inputText.trim()}
						class="size-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-white translate-x-px" viewBox="0 0 24 24" fill="currentColor">
							<path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
						</svg>
					</button>
				{:else}
					<div class="flex-1 flex items-center justify-between">
						<p class="text-sm text-gray-400">
							{status === 'fetching-key' || status === 'connecting' ? 'Connecting…' : 'Not connected'}
						</p>
						{#if status === 'disconnected' || status === 'error'}
							<button
								onclick={connect}
								class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
							>
								Connect
							</button>
						{/if}
					</div>
				{/if}
			</div>

		</div>
	</div>
</div>
