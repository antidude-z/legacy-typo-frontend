<script>
  import { onMount } from 'svelte';
  export let kind;
  export let itemId;
  let items = [];
  let error = '';
  let editing = null;
  let permissions = { can_edit: false, can_delete: false };
  let sort = 'id';
  let direction = 'desc';
  let page = 1;
  let form = { amount: '0', currency: 'RUB', actual_since: new Date().toISOString().slice(0, 10), actual_from: 0 };
  const endpoint = () => `/api/prices/${kind}/${itemId}/records`;
  async function load() {
    const response = await fetch(`${endpoint()}?page=${page}&sort=${sort}&order=${direction}`);
    if (!response.ok) { error = 'Не удалось загрузить цены'; return; }
    permissions = await response.json();
    items = permissions.items;
  }
  async function sortBy(field) {
    direction = sort === field && direction === 'asc' ? 'desc' : 'asc';
    sort = field;
    await load();
  }
  async function save() {
    const response = await fetch(endpoint() + (editing ? `/${editing}` : ''), {
      method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    if (!response.ok) { error = 'Не удалось сохранить цену'; return; }
    editing = null; error = ''; await load();
  }
  async function remove(id) {
    if (!window.confirm('Удалить цену?')) return;
    const response = await fetch(`${endpoint()}/${id}`, { method: 'DELETE' });
    if (!response.ok) { error = 'Цену нельзя удалить'; return; }
    await load();
  }
  onMount(load);
</script>

<div class="container-fluid">
  <h1 class="page-header">Цены <small>({permissions.title ?? ''})</small></h1>
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  {#if permissions.can_edit}
  <form onsubmit={(event) => { event.preventDefault(); save(); }} autocomplete="off">
    <div class="row">
      <div class="col-md-6">
        <div class="form-group"><label for="price_amount">Цена</label><input id="price_amount" class="form-control" required bind:value={form.amount} /></div>
        <div class="form-group"><label for="price_currency">Валюта</label><select id="price_currency" class="form-control" bind:value={form.currency}><option>RUB</option><option>USD</option><option>EUR</option></select></div>
        <div class="form-group"><label for="price_since">Цена действительна с даты</label><input id="price_since" class="form-control" type="date" required bind:value={form.actual_since} /></div>
        <div class="form-group"><label for="price_from">Цена действительна от</label><input id="price_from" class="form-control" type="number" required bind:value={form.actual_from} /></div>
        <button class="btn btn-primary" type="submit">Сохранить</button>
        <button class="btn btn-default" type="button" onclick={() => { editing = null; form = { amount: '0', currency: 'RUB', actual_since: new Date().toISOString().slice(0, 10), actual_from: 0 }; }}>Новая цена</button>
      </div>
    </div>
  </form>
  {/if}
  <table class="table table-striped table-bordered table-hover"><thead><tr>{#each [['id','ID'],['amount','Цена'],['currency','Валюта'],['actual_since','Актуальна с даты'],['actual_from','Актуальна с кол-ва']] as [field,label]}<th><button class="sort-button" onclick={() => sortBy(field)}>{label} {sort === field ? (direction === 'asc' ? '↑' : '↓') : ''}</button></th>{/each}<th>Действия</th></tr></thead><tbody>
    {#each items as price}<tr><td>{price.id}</td><td>{price.amount}</td><td>{price.currency}</td><td>{price.actual_since?.split('-').reverse().join('.')}</td><td>{price.actual_from}</td><td>{#if permissions.can_edit}<button class="btn btn-xs btn-primary" onclick={() => { editing = price.id; form = { ...price }; }}>Редактировать</button>{/if} {#if permissions.can_delete}<button class="btn btn-xs btn-danger" onclick={() => remove(price.id)}>Удалить</button>{/if}</td></tr>{:else}<tr><td colspan="6">Нет цен</td></tr>{/each}
  </tbody></table>
  <button class="btn btn-default" disabled={page <= 1} onclick={() => { page -= 1; load(); }}>‹</button>
  {page} / {permissions.last_page ?? 1}
  <button class="btn btn-default" disabled={page >= (permissions.last_page ?? 1)} onclick={() => { page += 1; load(); }}>›</button>
</div>