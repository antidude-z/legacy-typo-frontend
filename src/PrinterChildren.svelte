<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  export let printerId;
  export let kind;
  export let processId = null;
  export let identity = null;
  export let action = 'list';
  let data = {items: [], fields: []};
  let formats = [];
  let form = null;
  let error = '';
  let busy = false;
  const parent = processId ? `/references/printers/${printerId}/processes/${processId}` : `/references/printers/${printerId}`;
  const base = `${parent}/${kind}`;
  const api = `/api${base}`;
  const heading = {fields:'Печатные поля', processes:'Варианты печати', stages:'Этапы техпроцесса'}[kind];
  async function request(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(response.status === 422 && typeof result.detail === 'string' ? result.detail : inventoryError(response.status));
    return result;
  }
  async function save() {
    if (busy) return;
    busy = true; error = '';
    try {
      await request(action === 'create' ? api : `${api}/${identity}`, {method:action === 'create' ? 'POST' : 'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)});
      window.location.href = parent;
    } catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  async function remove() {
    if (busy) return;
    busy = true;
    try { await request(`${api}/${identity}`, {method:'DELETE'}); window.location.href = parent; }
    catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  onMount(async () => {
    try {
      if (action === 'show') { window.location.replace(`${base}/${identity}/edit`); return; }
      if (action === 'restore') { await request(`${api}/${identity}/restore`, {method:'POST'}); window.location.replace(parent); return; }
      const metadata = await request(`${api}/form`);
      formats = metadata.formats;
      if (action === 'list') { data = await request(`${api}/items`); return; }
      if (action === 'create') {
        data = {...metadata, ...await request(`${api}/create`, {method:'POST'})};
        if (kind !== 'fields') { window.location.replace(`${base}/${data.item.id}/edit`); return; }
        form = {...data.item, paper_format_id: formats[0]?.id ?? 0, pieces:1};
      } else { data = await request(`${api}/${identity}`); form = {...data.item}; }
    } catch (failure) { error = failure.message; }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{form?.title || heading}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if action === 'list'}
    <a class="btn btn-default" href={`${base}/create`}>{kind === 'fields' ? 'Новое печатное поле' : kind === 'processes' ? 'Новый вариант' : 'Новый этап'}</a> <a class="btn btn-default" href={parent}>Назад</a>
    <table class="table table-striped table-bordered table-hover"><thead><tr>{#each data.fields as [,label]}<th>{label}</th>{/each}<th>Действия</th></tr></thead><tbody>
      {#each data.items as row}<tr class:warning={row.deleted}>{#each data.fields as [key]}<td>{key === 'paper_format_id' ? row.format_title : row[key]}</td>{/each}<td><a class="btn btn-xs btn-primary" href={`${base}/${row.id}/edit`}>Редактировать</a> {#if row.deleted}{#if data.can_restore}<a class="btn btn-xs btn-info" href={`${base}/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a class="btn btn-xs btn-danger" href={`${base}/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else}<a class="btn btn-xs btn-danger" href={`${base}/${row.id}/delete`}>Удалить</a>{/if} {#if kind === 'processes'}<a href={`${base}/${row.id}/stages`}>Этапы</a>{/if} {#if kind === 'stages' && data.can_view_prices}<a href={`/prices/print/${row.id}`}>История цен</a>{/if}</td></tr>{:else}<tr><td colspan={data.fields.length + 1}>Нет записей</td></tr>{/each}
    </tbody></table>
  {:else if form && action === 'delete'}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно' : 'удалить'} {form.title || heading}?</p>{#if !form.deleted || data.can_delete_trashed}<button class="btn btn-danger" disabled={busy} onclick={remove}>Удалить</button>{/if} <a class="btn btn-default" href={parent}>Отменить</a></div></div>
  {:else if form}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault(); save();}}>
      {#each data.fields as [key,label,type]}<div class="form-group"><label for={`printer_child_${key}`}>{label}</label>{#if type === 'select'}<select id={`printer_child_${key}`} class="form-control" required bind:value={form[key]}>{#each formats as format}<option value={format.id}>{format.title}</option>{/each}</select>{:else}<input id={`printer_child_${key}`} class="form-control" type={type} required bind:value={form[key]} />{/if}</div>{/each}
      <button class="btn btn-primary" type="submit" disabled={busy || form.deleted}>Сохранить</button> <a class="btn btn-default" href={parent}>Отменить</a>
    </form>
    {#if kind === 'processes'}<a class="btn btn-default" href={`${base}/${identity}/stages`}>Этапы техпроцесса</a>{/if}
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>