<script>
  import { onMount } from 'svelte';
  import Navigation from './Navigation.svelte';
  import Login from './Login.svelte';
  import Orders from './Orders.svelte';

  let session = { authenticated: false, user: null, menu: [] };
  let users = {};
  let error = '';
  let path = window.location.pathname;

  async function loadSession() {
    const response = await fetch('/api/session');
    session = await response.json();
  }

  async function loadUsers() {
    const response = await fetch('/api/auth/users');
    users = await response.json();
  }

  async function login(credentials) {
    const body = new URLSearchParams(credentials);
    const response = await fetch('/api/auth/login', { method: 'POST', body, redirect: 'manual' });
    if (response.status === 303) {
      window.location.href = '/orders';
      return;
    }
    error = (await response.json()).message;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  }

  onMount(async () => {
    await loadSession();
    if (path === '/auth/login') await loadUsers();
  });
</script>

<svelte:head>
  <title>Типография</title>
</svelte:head>

<Navigation menu={session.menu} user={session.user} onLogout={logout} />
{#if path === '/auth/login'}
  <Login {users} {error} onSubmit={login} />
{:else if path === '/orders'}
  <Orders onUnauthenticated={() => (window.location.href = '/auth/login')} />
{:else}
  <main class="app-placeholder"><h1>Типография</h1><p>Раздел ожидает переноса функциональности.</p></main>
{/if}
