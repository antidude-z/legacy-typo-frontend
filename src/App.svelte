<script>
  import { onMount } from 'svelte';
  import Navigation from './Navigation.svelte';
  import Login from './Login.svelte';
  import Orders from './Orders.svelte';
  import OrderForm from './OrderForm.svelte';
  import OrderDetail from './OrderDetail.svelte';
  import Prices from './Prices.svelte';
  import PriceCatalog from './PriceCatalog.svelte';
  import PriceEditor from './PriceEditor.svelte';
  import ReferenceDictionary from './ReferenceDictionary.svelte';
  import ReferenceInventory from './ReferenceInventory.svelte';
  import { inventoryRoute } from './inventory.js';
  import ReferencePrinters from './ReferencePrinters.svelte';
  import PrinterChildren from './PrinterChildren.svelte';
  import { printerChildRoute } from './printerRoutes.js';
  import ReferenceAfterprints from './ReferenceAfterprints.svelte';
  import { afterprintRoute } from './afterprintRoutes.js';
  import ReferenceCompiles from './ReferenceCompiles.svelte';
  import { compileRoute } from './compileRoutes.js';
  import ReferenceWorks from './ReferenceWorks.svelte';
  import { workRoute } from './workRoutes.js';
  import ReferenceCustomers from './ReferenceCustomers.svelte';
  import { customerRoute } from './customerRoutes.js';
  import ReferenceUsers from './ReferenceUsers.svelte';
  import { employeeRoute } from './employeeRoutes.js';

  let session = { authenticated: false, user: null, menu: [] };
  let users = {};
  let error = '';
  let path = window.location.pathname;
  $: orderPath = path.match(/^\/orders\/(\d+)$/);
  $: createPath = path.match(/^\/orders\/add\/(book|poly|wide|souvenir)$/);
  $: pricePath = path.match(/^\/prices\/([a-z]+)\/(\d+)\/?$/);
  $: catalogPath = path.match(/^\/prices\/([a-z]+)\/?$/);
  $: priceEditorPath = path.match(/^\/prices\/([a-z]+)\/(\d+)\/(?:(create)|(\d+)(?:\/(edit|delete))?)\/?$/);
  $: recalculatePricePath = path.match(/^\/prices\/([a-z]+)\/recalculate\/?$/);
  $: referencePath = path.match(/^\/options\/(paper-type|paper-format|measures|customer-group)(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/);
  $: inventoryPath = inventoryRoute(path);
  $: printerPath = path.match(/^\/references\/printers(?:\/(create|\d+)(?:\/(edit|delete|restore))?)?\/?$/);
  $: printerChildPath = printerChildRoute(path);
  $: afterprintPath = afterprintRoute(path);
  $: compilePath = compileRoute(path);
  $: workPath = workRoute(path);
  $: customerPath = customerRoute(path);
  $: employeePath = employeeRoute(path);

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
    if (recalculatePricePath) { window.location.replace(`/prices/${recalculatePricePath[1]}`); return; }
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
{:else if priceEditorPath}
  <PriceEditor kind={priceEditorPath[1]} itemId={priceEditorPath[2]} priceId={priceEditorPath[4]} action={priceEditorPath[3] ? 'create' : (priceEditorPath[5] ?? 'edit')} />
{:else if pricePath}
  <Prices kind={pricePath[1]} itemId={pricePath[2]} />
{:else if catalogPath}
  <PriceCatalog kind={catalogPath[1]} />
{:else if referencePath}
  <ReferenceDictionary kind={referencePath[1]} identity={referencePath[2] === 'create' ? null : referencePath[2]} action={referencePath[2] === 'create' ? 'create' : (referencePath[3] ?? (referencePath[2] ? 'edit' : 'list'))} />
{:else if inventoryPath}
  <ReferenceInventory kind={inventoryPath.kind} identity={inventoryPath.identity} action={inventoryPath.action} />
{:else if employeePath}
  <ReferenceUsers {...employeePath} />
{:else if customerPath}
  <ReferenceCustomers {...customerPath} />
{:else if workPath}
  <ReferenceWorks {...workPath} />
{:else if compilePath}
  <ReferenceCompiles {...compilePath} />
{:else if afterprintPath}
  <ReferenceAfterprints {...afterprintPath} />
{:else if printerChildPath}
  <PrinterChildren {...printerChildPath} />
{:else if printerPath}
  <ReferencePrinters identity={printerPath[1] === 'create' ? null : printerPath[1]} action={printerPath[1] === 'create' ? 'create' : (printerPath[2] ?? (printerPath[1] ? 'show' : 'list'))} />
{:else if createPath}
  <OrderForm orderType={createPath[1]} onSaved={(id) => (window.location.href = `/orders/${id}`)} />
{:else if orderPath}
  <OrderDetail orderId={orderPath[1]} onBack={() => (window.location.href = '/orders')} />
{:else if path === '/orders'}
  <Orders onUnauthenticated={() => (window.location.href = '/auth/login')} />
{:else}
  <main class="app-placeholder"><h1>Типография</h1><p>Раздел ожидает переноса функциональности.</p></main>
{/if}
