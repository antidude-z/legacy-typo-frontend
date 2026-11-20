<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  export let kind;
  export let identity = null;
  export let action = 'list';
  let data = {items:[], page:1, last_page:1};
  let title = '';
  let error = '';
  let busy = false;
  let ready = false;
  const base = `/references/${kind}`;
  const api = `/api/reference-works/${kind}`;
  const heading = kind === 'prepresses' ? 'Работы по дизайну/препресс' : 'Работы по редактуре';
  const newHeading = kind === 'prepresses' ? 'Новая работа по дизайну/препресс' : 'Новая работа по редактуре';
  const field = kind === 'prepresses' ? 'prepress_title' : 'redaction_title';
  const query = new URLSearchParams(window.location.search);
  let sort = ['id','title'].includes(query.get('sort')) ? query.get('sort') : 'id';
  let order = query.get('order') === 'asc' ? 'asc' : 'desc';
  const perPage = Math.max(1, Number(query.get('per_page')) || 30);
  async function request(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(response.status === 422 && typeof result.detail === 'string' ? result.detail : inventoryError(response.status));
    return result;
  }
  async function load(page = 1) {
    try {
      data = await request(`${api}?page=${page}&per_page=${perPage}&sort=${sort}&order=${order}`);
      window.history.replaceState(null, '', `${base}?page=${data.page}&per_page=${perPage}&sort=${sort}&order=${order}`);
      error = '';
    } catch (failure) { error = failure.message; }
  }
  async function sortBy(key) { order = sort === key && order === 'asc' ? 'desc' : 'asc'; sort = key; await load(data.page); }
  async function save() {
    if (busy) return;
    busy = true; error = '';
    try {
      await request(action === 'create' ? api : `${api}/${identity}`, {method:action === 'create' ? 'POST' : 'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({[field]:title})});
      window.location.href = base;
    } catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  async function remove() {
    if (busy) return;
    busy = true;
    try { await request(`${api}/${identity}`, {method:'DELETE'}); window.location.href = base; }
    catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  onMount(async () => {
    try {
      if (action === 'list') { await load(Math.max(1, Number(query.get('page')) || 1)); return; }
      if (action === 'show') { window.location.replace(`${base}/${identity}/edit`); return; }
      if (action === 'restore') { await request(`${api}/${identity}/restore`, {method:'POST'}); window.location.replace(base); return; }
      if (action === 'create') { data = await request(`${api}/form-options`); }
      else { data = await request(`${api}/${identity}`); title = data.item.title; }
      ready = true;
    } catch (failure) { error = failure.message; }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{action === 'list' ? heading : action === 'create' ? newHeading : title || heading}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if action === 'list'}
    {#if data.can_edit}<a class="btn btn-default" href={`${base}/create`}>Новая работа</a>{/if}
    <table class="table table-striped table-bordered table-hover"><thead><tr><th><button class="sort-button" onclick={() => sortBy('id')}>ID {sort === 'id' ? (order === 'asc' ? '↑' : '↓') : ''}</button></th><th><button class="sort-button" onclick={() => sortBy('title')}>Название {sort === 'title' ? (order === 'asc' ? '↑' : '↓') : ''}</button></th><th>Действия</th></tr></thead><tbody>
      {#each data.items as row}<tr class:warning={row.deleted}><td>{row.id}</td><td>{row.title}{#if row.deleted} (удалено){/if}</td><td><a class="btn btn-xs btn-primary" href={`${base}/${row.id}/edit`}>{data.can_edit ? 'Редактировать' : 'Просмотр'}</a> {#if row.deleted}{#if data.can_restore}<a class="btn btn-xs btn-info" href={`${base}/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a class="btn btn-xs btn-danger" href={`${base}/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else if data.can_delete}<a class="btn btn-xs btn-danger" href={`${base}/${row.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan="3">Нет работ</td></tr>{/each}
    </tbody></table>
    <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
  {:else if ready && action === 'delete'}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {data.item.deleted ? 'удалить окончательно' : 'удалить'} {title}?</p>{#if data.item.deleted ? data.can_delete_trashed : data.can_delete}<button class="btn btn-danger" disabled={busy} onclick={remove}>Удалить</button>{/if} <a class="btn btn-default" href={base}>Отменить</a></div></div>
  {:else if ready}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault(); save();}}>
      <div class="form-group"><label for={field}>Название работы</label><input id={field} name={field} class="form-control" required maxlength="50" placeholder="Введите название работы" bind:value={title} disabled={!data.can_edit || data.item?.deleted} /></div>
      {#if data.can_edit}<button class="btn btn-primary" type="submit" disabled={busy || data.item?.deleted}>Сохранить</button>{/if} <a class="btn btn-default" href={base}>Отменить</a>
    </form>
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>