<script>
  import { onMount } from 'svelte';
  export let kind;
  export let itemId;
  export let priceId = null;
  export let action = 'edit';
  let data = null;
  let error = '';
  let form = {};
  const base = `/prices/${kind}/${itemId}/`;
  const api = `/api/prices/${kind}/${itemId}`;
  const fromList = new URLSearchParams(window.location.search).get('from') === 'list';
  onMount(async () => {
    if (action === 'create') {
      const response = await fetch(`${api}/create`, { method: 'POST' });
      if (!response.ok) { error = 'Не удалось создать цену'; return; }
      const price = await response.json();
      window.location.replace(`${base}${price.id}/edit?from=${fromList ? 'list' : 'index'}`);
      return;
    }
    const response = await fetch(`${api}/records/${priceId}`);
    if (!response.ok) { error = 'Цена не существует'; return; }
    data = await response.json();
    form = { ...data.price, actual_since: data.price.actual_since.split('-').reverse().join('.') };
  });
  async function submit() {
    const response = await fetch(`${api}/records/${priceId}`, {
      method: action === 'delete' ? 'DELETE' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      ...(action === 'delete' ? {} : { body: JSON.stringify(form) })
    });
    if (!response.ok) { error = 'Не удалось сохранить изменения'; return; }
    window.location.href = action !== 'delete' && fromList ? `/prices/${kind}/` : base;
  }
</script>

<div class="container-fluid">
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  {#if data}
    {#if action === 'delete'}
      <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body">
        {#if data.can_delete}<p>Вы действительно хотите удалить цену?</p><button class="btn btn-danger" onclick={submit}>Удалить</button>{:else}<p>Цену нельзя удалить</p>{/if}
        <a class="btn btn-default" href={base}>Отменить</a>
      </div></div>
    {:else}
      <h1 class="page-header">Цена <small>({data.title})</small></h1>
      <form autocomplete="off" onsubmit={(event) => { event.preventDefault(); submit(); }}>
        <div class="form-group"><label for="amount">Цена</label><input id="amount" class="form-control" required bind:value={form.amount} /></div>
        <div class="form-group"><label for="currency">Валюта</label><select id="currency" class="form-control" bind:value={form.currency}><option>RUB</option><option>USD</option><option>EUR</option></select></div>
        <div class="form-group"><label for="since">Цена действительна с даты</label><input id="since" class="form-control" placeholder="ДД.ММ.ГГГГ" required bind:value={form.actual_since} /></div>
        <div class="form-group"><label for="threshold">Цена действительна от</label><input id="threshold" class="form-control" type="number" min="0" max="10000" step="10" bind:value={form.actual_from} /></div>
        <button class="btn btn-primary" type="submit">Сохранить</button> <a class="btn btn-default" href={base}>Отменить</a>
      </form>
    {/if}
  {/if}
</div>