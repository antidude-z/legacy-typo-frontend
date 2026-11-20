<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  export let identity = null;
  export let action = 'list';
  let data = {items:[], fields:[], groups:[], page:1, last_page:1};
  let form = null;
  let error = '';
  let busy = false;
  let sort = 'id';
  let order = 'desc';
  const base = '/references/customers';
  const api = '/api/customer-references';
  async function request(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(response.status === 422 && typeof result.detail === 'string' ? result.detail : inventoryError(response.status));
    return result;
  }
  async function load(page = 1) {
    try { data = await request(`${api}?page=${page}&sort=${sort}&order=${order}`); error = ''; }
    catch (failure) { error = failure.message; }
  }
  async function sortBy(key) { order = sort === key && order === 'asc' ? 'desc' : 'asc'; sort = key; await load(data.page); }
  async function save() {
    if (busy) return;
    busy = true; error = '';
    try {
      await request(action === 'create' ? api : `${api}/${identity}`, {method:action === 'create' ? 'POST' : 'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)});
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
      if (action === 'list') { await load(); return; }
      if (action === 'show') { window.location.replace(`${base}/${identity}/edit`); return; }
      if (action === 'restore') { await request(`${api}/${identity}/restore`, {method:'POST'}); window.location.replace(base); return; }
      if (action === 'create') {
        data = {...data, ...await request(`${api}/form`)};
        form = {title:'', phone:'', inn:'', address:'', description:'', customer_group_id:0};
      } else { data = {...data, ...await request(`${api}/${identity}`)}; form = {...data.item, customer_group_id:data.item.customer_group_id ?? 0}; }
    } catch (failure) { error = failure.message; }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{action === 'list' ? 'Заказчики' : action === 'create' ? 'Новый заказчик' : form?.title || 'Заказчик'}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if action === 'list'}
    <a class="btn btn-default" href={`${base}/create`}>Новый заказчик</a>
    <table class="table table-striped table-bordered table-hover"><thead><tr>{#each [['id','ID'],['title','Название'],['customer_group_id','Группа']] as [key,label]}<th><button class="sort-button" onclick={() => sortBy(key)}>{label} {sort === key ? (order === 'asc' ? '↑' : '↓') : ''}</button></th>{/each}<th>ИНН</th><th>Телефон</th><th>Адрес</th><th>Описание</th><th>Действия</th></tr></thead><tbody>
      {#each data.items as row}<tr class:warning={row.deleted}><td>{row.id}</td><td>{row.title}{#if row.deleted} (удалено){/if}</td><td>{row.group_title}</td><td>{row.inn ?? ''}</td><td>{row.phone ?? ''}</td><td>{row.address ?? ''}</td><td>{row.description ?? ''}</td><td><a class="btn btn-xs btn-primary" href={`${base}/${row.id}/edit`}>Редактировать</a> {#if row.deleted}{#if data.can_restore}<a class="btn btn-xs btn-info" href={`${base}/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a class="btn btn-xs btn-danger" href={`${base}/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else}<a class="btn btn-xs btn-danger" href={`${base}/${row.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan="8">Нет заказчиков</td></tr>{/each}
    </tbody></table>
    <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
  {:else if form && action === 'delete'}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно' : 'удалить'} {form.title}?</p>{#if form.deleted ? data.can_delete_trashed : data.can_delete}<button class="btn btn-danger" disabled={busy} onclick={remove}>Удалить</button>{/if} <a class="btn btn-default" href={base}>Отменить</a></div></div>
  {:else if form}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault(); if (data.can_edit) save();}}>
      <fieldset disabled={!data.can_edit || form.deleted}>
      {#each data.fields as [key,label,type]}<div class="form-group"><label for={`customer_${key}`}>{label}</label>{#if type === 'select'}<select id={`customer_${key}`} class="form-control" bind:value={form[key]}><option value={0}>Не указана</option>{#if form[key] && !data.groups.some(group => group.id === Number(form[key]))}<option value={form[key]}>Unavailable group #{form[key]}</option>{/if}{#each data.groups as group}<option value={group.id}>{group.title}</option>{/each}</select>{:else if type === 'textarea'}<textarea id={`customer_${key}`} class="form-control" rows="3" bind:value={form[key]}></textarea>{:else}<input id={`customer_${key}`} class="form-control" required={key === 'title'} bind:value={form[key]} />{/if}</div>{/each}
      <button class="btn btn-primary" type="submit" disabled={busy || form.deleted || !data.can_edit}>Сохранить</button> <a class="btn btn-default" href={base}>Отменить</a>
      </fieldset>
    </form>
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>