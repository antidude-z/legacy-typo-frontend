<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  export let identity = null;
  export let stageId = null;
  export let itemId = null;
  export let level = 'list';
  export let action = 'list';
  let data = {items: [], page:1, last_page:1};
  let form = null;
  let fields = [];
  let choices = [];
  let error = '';
  let busy = false;
  let sort = 'id';
  let order = 'desc';
  const root = '/references/compiles';
  const definition = `${root}/${identity}`;
  const collection = level === 'material' ? `${definition}/stages/${stageId}/materials` : `${definition}/stages`;
  const target = level === 'definition' ? definition : level === 'stage' ? `${collection}/${stageId}` : `${collection}/${itemId}`;
  const parent = level === 'material' ? `${definition}/stages/${stageId}` : level === 'stage' ? definition : root;
  const productionNames = {book:'Книги, брошюры',poly:'Полиграфия',souvenir:'Сувенирная печать',wide:'Широкоформатная печать'};

  async function request(url, options) {
    const response = await fetch(`/api${url}`, options);
    const result = await response.json();
    if (!response.ok) throw new Error(response.status === 422 && typeof result.detail === 'string' ? result.detail : inventoryError(response.status));
    return result;
  }
  async function load(page = 1) {
    try { data = await request(`${root}?page=${page}&sort=${sort}&order=${order}`); }
    catch (failure) { error = failure.message; }
  }
  async function sortBy(key) { order = sort === key && order === 'asc' ? 'desc' : 'asc'; sort = key; await load(data.page); }
  async function save() {
    if (busy) return;
    busy = true; error = '';
    try {
      await request(action === 'create' ? (level === 'definition' ? root : collection) : target, {method:action === 'create' ? 'POST' : 'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)});
      window.location.href = parent;
    } catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  async function remove() {
    if (busy) return;
    busy = true;
    try { await request(target, {method:'DELETE'}); window.location.href = parent; }
    catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  onMount(async () => {
    try {
      if (level === 'list') { await load(); return; }
      if (action === 'show') { window.location.replace(`${target}/edit`); return; }
      if (action === 'restore') { await request(`${target}/restore`, {method:'POST'}); window.location.replace(parent); return; }
      if (level === 'definition' && action === 'create') {
        data = await request(root); form = {title:'', fitting:0, production_book:false, production_poly:false, production_souvenir:false, production_wide:false}; return;
      }
      if (level === 'material') {
        const metadata = await request(`${collection}/form`); choices = metadata.choices;
        if (action === 'create') { data = metadata; form = {...metadata.item, material_id:choices[0]?.id ?? ''}; }
      }
      if (level === 'stage' && action === 'create') { data = await request(`${collection}/form`); form = {...data.item}; }
      else if (action !== 'create') { data = await request(target); form = {...data.item}; }
      fields = data.fields ?? [];
    } catch (failure) { error = failure.message; }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{level === 'list' ? 'Работы по сборке' : form?.title || (level === 'stage' ? 'Этап работы по сборке' : level === 'material' ? 'Материал этапа' : 'Новая работа по сборке')}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if level === 'list'}
    {#if data.can_edit}<a class="btn btn-default" href={`${root}/create`}>Новая работа по сборке</a>{/if}
    <table class="table table-striped table-bordered table-hover"><thead><tr><th><button class="sort-button" onclick={() => sortBy('id')}>ID</button></th><th><button class="sort-button" onclick={() => sortBy('title')}>Название</button></th><th>Продукция</th><th>Листов на приладку</th><th>Действия</th></tr></thead><tbody>
      {#each data.items as row}<tr class:warning={row.deleted}><td>{row.id}</td><td>{row.title}</td><td>{Object.entries(row.production).filter(([,active]) => active).map(([key]) => productionNames[key]).join('; ')}</td><td>{row.fitting}</td><td><a class="btn btn-xs btn-primary" href={`${root}/${row.id}/edit`}>Редактировать</a> {#if row.deleted}{#if data.can_restore}<a href={`${root}/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a href={`${root}/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else if data.can_delete}<a href={`${root}/${row.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan="5">Нет работ по сборке</td></tr>{/each}
    </tbody></table>
    <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
  {:else if form && action === 'delete'}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно' : 'удалить'} {form.title || 'запись'}?</p>{#if form.deleted ? data.can_delete_trashed : data.can_delete}<button class="btn btn-danger" disabled={busy} onclick={remove}>Удалить</button>{/if} <a class="btn btn-default" href={parent}>Отменить</a></div></div>
  {:else if form}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault(); if (data.can_edit) save();}}>
      <fieldset disabled={!data.can_edit || form.deleted}>
      {#if level === 'definition'}
        <div class="form-group"><label for="compile_title">Название</label><input id="compile_title" class="form-control" required maxlength="50" bind:value={form.title} /></div>
        <div class="form-group"><label for="compile_fitting">Листов на приладку</label><input id="compile_fitting" class="form-control" type="number" min="0" required bind:value={form.fitting} /></div>
        <div class="production-checks">{#each Object.entries(productionNames) as [key,label]}<label><input type="checkbox" bind:checked={form[`production_${key}`]} /> {label}</label>{/each}</div>
      {:else}
        {#each fields as [key,label,type]}<div class="form-group">
          {#if type === 'checkbox'}<label><input type="checkbox" bind:checked={form[key]} /> {label}</label>
          {:else}<label for={`compile_${key}`}>{label}</label>{#if type === 'select'}<select id={`compile_${key}`} class="form-control" required bind:value={form[key]}>{#each choices as choice}<option value={choice.id}>{choice.title}</option>{/each}</select>{:else}<input id={`compile_${key}`} class="form-control" type={type === 'text' ? 'text' : 'number'} step={type === 'decimal' ? '0.0001' : '1'} required={type !== 'optional-number'} bind:value={form[key]} />{/if}{/if}
        </div>{/each}
      {/if}
      <button class="btn btn-primary" type="submit" disabled={busy || form.deleted || !data.can_edit}>Сохранить</button> <a class="btn btn-default" href={parent}>Вернуться</a>
      </fieldset>
    </form>
    {#if level === 'definition' && action !== 'create'}
      {#if data.can_view_prices}<a class="btn btn-default" href={`/prices/compile/${identity}`}>История цен</a>{/if}
      <h2>Этапы работы</h2>{#if data.can_edit}<a class="btn btn-default" href={`${definition}/stages/create`}>Новый этап</a>{/if}
      <table class="table table-striped table-bordered"><thead><tr><th>Название</th><th>В обработке</th><th>Отходы за прогон</th><th>Приладка</th><th>Актуальная цена, руб.</th><th>Действия</th></tr></thead><tbody>
        {#each data.stages as row}<tr class:warning={row.deleted}><td>{row.title}</td><td>{row.together}</td><td>{row.waste}</td><td>{row.fitting ? 'Да' : 'Нет'}</td><td>{row.price}</td><td><a href={`${definition}/stages/${row.id}/edit`}>Редактировать</a> {#if row.deleted}{#if data.can_restore}<a href={`${definition}/stages/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a href={`${definition}/stages/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else if data.can_delete}<a href={`${definition}/stages/${row.id}/delete`}>Удалить</a>{/if} {#if data.can_view_prices}<a href={`/prices/compiles/${row.id}`}>История цен</a>{/if}</td></tr>{:else}<tr><td colspan="6">Этапы не введены</td></tr>{/each}
      </tbody></table>
    {:else if level === 'stage' && action !== 'create'}
      <h2>Материалы</h2>{#if data.can_edit}<a class="btn btn-default" href={`${target}/materials/create`}>Новый материал</a>{/if}
      <table class="table table-striped table-bordered"><thead><tr><th>Название</th><th>Количество</th><th>Действия</th></tr></thead><tbody>{#each data.materials as row}<tr class:warning={row.deleted}><td>{row.title}</td><td>{row.quantity}</td><td><a href={`${target}/materials/${row.id}/edit`}>Редактировать</a> {#if row.deleted}{#if data.can_restore}<a href={`${target}/materials/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a href={`${target}/materials/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else if data.can_delete}<a href={`${target}/materials/${row.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan="3">Материалы не введены</td></tr>{/each}</tbody></table>
    {/if}
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>