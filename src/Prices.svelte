<script>
  import { onMount } from 'svelte';
  import { priceError } from './pricing.js';
  export let kind;
  export let itemId;
  let items = [];
  let error = '';
  let permissions = { can_edit: false, can_delete: false };
  let sort = 'id';
  let direction = 'desc';
  let page = 1;
  const endpoint = () => `/api/prices/${kind}/${itemId}/records`;
  async function load() {
    try {
    const response = await fetch(`${endpoint()}?page=${page}&sort=${sort}&order=${direction}`);
    if (!response.ok) { error = priceError(response.status); return; }
    permissions = await response.json();
    items = permissions.items;
    error = '';
    } catch { error = priceError(0); }
  }
  async function sortBy(field) {
    direction = sort === field && direction === 'asc' ? 'desc' : 'asc';
    sort = field;
    await load();
  }
  onMount(load);
</script>

<div class="container-fluid">
  <h1 class="page-header">{permissions.heading ?? 'Цены'} <small>({permissions.title ?? ''})</small></h1>
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  {#if permissions.can_edit}<a class="btn btn-default" href={`/prices/${kind}/${itemId}/create`}>Новая цена</a>{/if}
  <table class="table table-striped table-bordered table-hover"><thead><tr>{#each [['id','ID'],['amount','Цена'],['currency','Валюта'],['actual_since','Актуальна с даты'],['actual_from','Актуальна с кол-ва']] as [field,label]}<th><button class="sort-button" onclick={() => sortBy(field)}>{label} {sort === field ? (direction === 'asc' ? '↑' : '↓') : ''}</button></th>{/each}<th>Действия</th></tr></thead><tbody>
    {#each items as price}<tr><td>{price.id}</td><td>{price.amount}</td><td>{price.currency}</td><td>{price.actual_since?.split('-').reverse().join('.')}</td><td>{price.actual_from}</td><td>{#if permissions.can_edit}<a class="btn btn-xs btn-primary" href={`/prices/${kind}/${itemId}/${price.id}/edit`}>Редактировать</a>{/if} {#if permissions.can_delete}<a class="btn btn-xs btn-danger" href={`/prices/${kind}/${itemId}/${price.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan="6">Нет цен</td></tr>{/each}
  </tbody></table>
  <button class="btn btn-default" disabled={page <= 1} onclick={() => { page -= 1; load(); }}>‹</button>
  {page} / {permissions.last_page ?? 1}
  <button class="btn btn-default" disabled={page >= (permissions.last_page ?? 1)} onclick={() => { page += 1; load(); }}>›</button>
</div>