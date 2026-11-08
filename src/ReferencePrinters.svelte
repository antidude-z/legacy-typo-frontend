<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  export let identity = null;
  export let action = 'list';
  let data = { items: [], page: 1, last_page: 1 };
  let form = null;
  let error = '';
  let busy = false;
  let sort = 'id';
  let order = 'desc';
  const base = '/references/printers';
  const api = '/api/references/printers';
  const productions = [['book', 'Книги, брошюры'], ['poly', 'Полиграфия'], ['souvenir', 'Сувенирная печать'], ['wide', 'Широкоформатная печать']];

  async function request(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(inventoryError(response.status));
    return response.json();
  }
  async function load(page = 1) {
    try { data = await request(`${api}?page=${page}&sort=${sort}&order=${order}`); error = ''; }
    catch (failure) { error = failure.message; }
  }
  async function sortBy(key) { order = sort === key && order === 'asc' ? 'desc' : 'asc'; sort = key; await load(data.page); }
  async function save() {
    if (busy) return;
    busy = true; error = '';
    try { await request(`${api}/${identity}`, {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)}); window.location.href = base; }
    catch (failure) { error = failure.message; }
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
      if (action === 'list') { await load(); return; }
      if (action === 'show') { window.location.replace(`${base}/${identity}/edit`); return; }
      if (action === 'create') {
        const result = await request(`${api}/create`, {method:'POST'});
        window.location.replace(`${base}/${result.id}/edit`); return;
      }
      if (action === 'restore') { await request(`${api}/${identity}/restore`, {method:'POST'}); window.location.replace(base); return; }
      data = await request(`${api}/${identity}`); form = {...data.item};
    } catch (failure) { error = failure.message; }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{action === 'list' ? 'Печатные машины' : form?.title ?? 'Печатная машина'}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if action === 'list'}
    <a class="btn btn-default" href={`${base}/create`}>Новая печатная машина</a>
    <table class="table table-striped table-bordered table-hover"><thead><tr><th><button class="sort-button" onclick={() => sortBy('id')}>ID</button></th><th><button class="sort-button" onclick={() => sortBy('title')}>Название</button></th><th>Тип продукции</th><th>Действия</th></tr></thead><tbody>
      {#each data.items as row}<tr class:warning={row.deleted}><td>{row.id}</td><td>{row.title}{#if row.deleted} (удалено){/if}</td><td>{productions.filter(([key]) => row.production[key]).map(([,title]) => title).join('; ')}</td><td><a class="btn btn-xs btn-primary" href={`${base}/${row.id}/edit`}>Редактировать</a> {#if row.deleted}{#if data.can_restore}<a class="btn btn-xs btn-info" href={`${base}/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a class="btn btn-xs btn-danger" href={`${base}/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else}<a class="btn btn-xs btn-danger" href={`${base}/${row.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan="4">Нет печатных машин</td></tr>{/each}
    </tbody></table>
    <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
  {:else if form && action === 'delete'}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно' : 'удалить'} {form.title}?</p>{#if !form.deleted || data.can_delete_trashed}<button class="btn btn-danger" disabled={busy} onclick={remove}>Удалить</button>{/if} <a class="btn btn-default" href={base}>Отменить</a></div></div>
  {:else if form}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault(); save();}}>
      <label for="printer_title">Название</label><input id="printer_title" name="printer_title" class="form-control" required maxlength="50" bind:value={form.title} />
      <label><input type="checkbox" bind:checked={form.need_imagesetter} /> Требуется фотовывод</label>
      <div class="production-checks">{#each productions as [key,title]}<label><input type="checkbox" bind:checked={form[`production_${key}`]} /> {title}</label>{/each}</div>
      <button class="btn btn-primary" type="submit" disabled={busy || form.deleted}>Сохранить</button> <a class="btn btn-default" href={base}>Отменить</a>
    </form>
    <h2>Варианты печати</h2>
    <table class="table table-striped table-bordered"><thead><tr><th>Название</th><th>Цветность</th><th>Разрешение, dpi</th><th>Отбраковка</th></tr></thead><tbody>{#each data.processes as process}<tr><td>{process.title}</td><td>{process.colors_front} / {process.colors_back}</td><td>{process.resolution}</td><td>{process.rejection}</td></tr>{:else}<tr><td colspan="4">Варианты не введены</td></tr>{/each}</tbody></table>
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>