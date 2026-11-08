<script>
  import { onMount } from 'svelte';
  import { priceError } from './pricing.js';
  export let kind;
  let data = { items: [], page: 1, last_page: 1 };
  let error = '';
  async function load(page = 1) {
    try {
    const response = await fetch(`/api/pricing/catalog/${kind}?page=${page}`);
    if (!response.ok) { error = priceError(response.status); return; }
    data = await response.json();
    error = '';
    } catch { error = priceError(0); }
  }
  onMount(() => load());
</script>
<div class="container-fluid">
  <h1 class="page-header">{data.heading ?? 'Цены'}</h1>
  <a class="btn btn-default" href={`/prices/${kind}/recalculate`}>Пересчитать цены</a>
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  <table class="table table-striped table-bordered table-hover"><thead><tr><th>ID</th><th>Название</th><th>Актуальная цена, руб.</th><th>Действия</th></tr></thead><tbody>
    {#each data.items as item}<tr><td>{item.id}</td><td>{item.title}</td><td class="text-right">{item.current_price}</td><td><a href={`/prices/${kind}/${item.id}/`}>История цен</a> {#if data.can_edit}<a href={`/prices/${kind}/${item.id}/create?from=list`}>Указать цену</a>{/if}</td></tr>{:else}<tr><td colspan="4">Нет записей</td></tr>{/each}
  </tbody></table>
  <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button>
  {data.page} / {data.last_page}
  <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
</div>