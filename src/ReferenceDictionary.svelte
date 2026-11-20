<script>
  import { onMount } from 'svelte';
  export let kind;
  export let identity = null;
  export let action = 'list';
  let data = { metadata: { title: 'Справочник', fields: [] }, items: [], page: 1, last_page: 1, can_restore: false, can_delete_trashed: false };
  let editing = null;
  let form = {};
  let error = '';
  let sort = 'id';
  let order = 'desc';
  let busy = false;
  let fieldErrors = {};
  const base = `/options/${kind}`;

  async function load(page = 1) {
    const response = await fetch(`/api/options/${kind}?page=${page}&sort=${sort}&order=${order}`);
    if (!response.ok) { error = 'Не удалось загрузить справочник'; return; }
    data = await response.json();
  }
  async function save() {
    if (busy) return;
    busy = true;
    fieldErrors = {};
    try {
    const response = editing === 'new'
      ? await fetch(`/api/options/${kind}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) })
      : await fetch(`/api/options/${kind}/${editing}`, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    if (!response.ok) { fieldErrors = (await response.json()).errors ?? {}; error = 'Не удалось сохранить запись'; return; }
    window.location.href = base;
    } catch { error = 'Ошибка соединения'; }
    finally { busy = false; }
  }
  async function remove(id) {
    if (busy) return;
    busy = true;
    try {
      const response = await fetch(`/api/options/${kind}/${id}`, {method: 'DELETE'});
      if (!response.ok) { error = 'Не удалось удалить запись'; return; }
      window.location.href = base;
    } catch { error = 'Ошибка соединения'; }
    finally { busy = false; }
  }
  async function restore(id) {
    const response = await fetch(`/api/options/${kind}/${id}/restore`, {method: 'POST'});
    if (!response.ok) { error = 'Недостаточно прав для восстановления'; return; }
    window.location.replace(base);
  }
  async function changeSort(field) { order = sort === field && order === 'asc' ? 'desc' : 'asc'; sort = field; await load(data.page); }
  onMount(async () => {
    try {
      await load();
      if (action === 'create') {
        const response = await fetch(`/api/options/${kind}/create`, {method: 'POST'});
        if (!response.ok) { error = 'Не удалось создать запись'; return; }
        const result = await response.json();
        if (result.item.id) { window.location.replace(`${base}/${result.item.id}/edit`); return; }
        editing = 'new'; form = result.item;
      } else if (action === 'restore') {
        await restore(identity);
      } else if (identity) {
        const response = await fetch(`/api/options/${kind}/${identity}`);
        if (!response.ok) { error = 'Запись не существует'; return; }
        const result = await response.json();
        data = {...data, ...result}; form = result.item; editing = form.id;
      }
    } catch { error = 'Ошибка соединения'; }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{action === 'list' ? data.metadata.title : action === 'create' ? data.metadata.new : (form.title || data.metadata.singular)}</h1>
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  {#if action === 'delete' && editing !== null}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно' : 'удалить'} {form.title}?</p><a class="btn btn-default" href={base}>Отменить</a> <button class="btn btn-danger" disabled={busy} onclick={() => remove(identity)}>Удалить</button></div></div>
  {:else if editing !== null}<form class="reference-form" autocomplete="off" onsubmit={(event) => { event.preventDefault(); if (data.can_edit) save(); }}>
    <fieldset disabled={!data.can_edit || form.deleted}>
    {#each data.metadata.fields as field}<div class="form-group"><label for={field.name}>{field.label}</label><input id={field.name} name={field.name} class="form-control" type={field.type} required bind:value={form[field.key]} />{#if fieldErrors[field.name]}<p class="text-danger">{fieldErrors[field.name]}</p>{/if}</div>{/each}
    <button class="btn btn-primary" type="submit" disabled={busy || form.deleted || !data.can_edit}>Сохранить</button> <a class="btn btn-default" href={base}>Отменить</a>
    </fieldset>
  </form>{/if}
  {#if action === 'list'}
  {#if data.can_edit}<a class="btn btn-default" href={`${base}/create`}>{data.metadata.new}</a>{/if}
  <table class="table table-striped table-bordered table-hover"><thead><tr><th><button class="sort-button" onclick={() => changeSort('id')}>ID</button></th>{#each data.metadata.fields as field}<th><button class="sort-button" onclick={() => changeSort(field.key)}>{field.label}</button></th>{/each}<th>Действия</th></tr></thead><tbody>
    {#each data.items as item}<tr class:warning={item.deleted}><td>{item.id}</td>{#each data.metadata.fields as field}<td>{item[field.key]}{#if field.key === 'title' && item.deleted} (удалено){/if}</td>{/each}<td><a class="btn btn-xs btn-primary" href={`${base}/${item.id}/edit`}>Редактировать</a> {#if item.deleted}{#if data.can_restore}<a class="btn btn-xs btn-info" href={`${base}/${item.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a class="btn btn-xs btn-danger" href={`${base}/${item.id}/delete`}>Удалить окончательно</a>{/if}{:else}<a class="btn btn-xs btn-danger" href={`${base}/${item.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan={data.metadata.fields.length + 2}>Нет записей</td></tr>{/each}
  </tbody></table>
  <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
  {/if}
</div>