<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let message = '';
  let error = '';

  onMount(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      goto('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/greeting', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        message = data.message;
      } else if (res.status === 401) {
        error = 'Unauthorized. Please log in again.';
        localStorage.removeItem('token');
        goto('/login');
      } else {
        error = 'Something went wrong.';
      }
    } catch (e) {
      error = 'Could not connect to server.';
    }
  });
</script>

<div class="p-10 text-center">
  {#if message}
    <h1 class="text-2xl font-bold text-green-600">{message}</h1>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else}
    <p>Loading...</p>
  {/if}
</div>
