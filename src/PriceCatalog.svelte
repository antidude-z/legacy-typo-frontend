<script>
  import { onMount } from 'svelte';
  export let kind;
  let data = { items: [], page: 1, last_page: 1 };
  let error = '';
  async function load(page = 1) {
    const response = await fetch(`/api/pricing/catalog/${kind}?page=${page}`);
    if (!response.ok) { error = 'Не удалось загрузить цены'; return; }
    data = await response.json();
  }
  onMount(() => load());
</script>
<div class="container-fluid">
  <h1 class="page-header">Цены</h1>
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  <table class="table table-striped table-bordered"><thead><tr><th>Название</th><th>Цены</th></tr></thead><tbody>
    {#each data.items as item}<tr><td>{item.title}</td><td><a href={`/prices/${kind}/${item.id}`}>Цены</a></td></tr>{:else}<tr><td colspan="2">Нет записей</td></tr>{/each}
  </tbody></table>
  <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button>
  {data.page} / {data.last_page}
  <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
</div>