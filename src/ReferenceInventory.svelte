<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  export let kind;
  export let identity = null;
  export let action = 'list';
  let data = { items: [], page: 1, last_page: 1, metadata: {} };
  let form = null;
  let editing = null;
  let error = '';
  let filterText = '';
  let filterType = '';
  let sort = 'id';
  let direction = 'desc';
  let busy = false;
  let ready = false;
  const isPaper = kind === 'paper';
  const base = isPaper ? '/api/references/paper' : '/api/references/materials';
  const routeBase = `/references/${kind}`;
  async function request(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(inventoryError(response.status, result.error));
    return result;
  }
  async function load(page = 1) {
    try {
    const query = `?page=${page}&sort=${sort}&order=${direction}`;
    data = await request(base + query);
    if (!isPaper && data.filter) { filterText = data.filter.filter_text; filterType = data.filter.filter_type; }
    error = '';
    } catch (failure) { error = failure.message || inventoryError(0); }
  }
  async function applyFilter(flush = false) {
    try {
    await request(`${base}/filter`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({filter_text:filterText, filter_type:filterType, flush})});
    await load(1);
    } catch (failure) { error = failure.message || inventoryError(0); }
  }
  async function changeSort(field) { direction = sort === field && direction === 'asc' ? 'desc' : 'asc'; sort = field; await load(data.page); }
  function blankPaper() { return { type_id: data.metadata.types?.[0]?.id ?? '', format_id: data.metadata.formats?.[0]?.id ?? '', weight: 80, markup: 10 }; }
  function blankMaterial() { return { title: '', description: '', measure_id: data.metadata.measures?.[0]?.id ?? '', work_type: 'print', production_book: false, production_poly: false, production_souvenir: false, production_wide: false }; }
  async function create() {
    window.location.href = `${routeBase}/create`;
  }
  async function save() {
    if (busy) return;
    busy = true;
    error = '';
    try {
    const url = isPaper ? `${base}/${editing}` : (editing === 'new' ? base : `${base}/${editing}`);
    await request(url, {method: editing === 'new' ? 'POST' : 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form)});
    window.location.href = routeBase;
    } catch (failure) { error = failure.message || inventoryError(0); }
    finally { busy = false; }
  }
  async function confirmDelete() {
    if (busy) return;
    busy = true; error = '';
    try { await request(`${base}/${identity}`, {method:'DELETE'}); window.location.href = routeBase; }
    catch (failure) { error = failure.message || inventoryError(0); }
    finally { busy = false; }
  }
  function edit(item) {
    editing = item.id;
    form = {...item};
    if (!isPaper) for (const [key, value] of Object.entries(item.production)) form[`production_${key}`] = value;
  }
  onMount(async () => {
    try {
      if (action === 'list') { await load(); return; }
      if (action === 'show') { window.location.replace(`${routeBase}/${identity}/edit`); return; }
      if (action === 'restore') {
        await request(`${base}/${identity}/restore`, {method:'POST'});
        window.location.replace(routeBase); return;
      }
      if (action === 'create' && isPaper) {
        const result = await request(`${base}/create`, {method:'POST'});
        window.location.replace(`${routeBase}/${result.id}/edit`); return;
      }
      if (action === 'create') {
        const result = await request(`${base}/form/options`);
        data = {...data, ...result};
        form = blankMaterial(); editing = 'new';
      } else {
        const result = await request(`${base}/${identity}`);
        data = {...data, ...result};
        form = result.item; editing = identity;
      }
      ready = true;
    } catch (failure) { error = failure.message || inventoryError(0); }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{isPaper ? 'Бумага' : 'Материалы'}</h1>
  {#if action === 'list'}
  <button class="btn btn-default" onclick={create}>{isPaper ? 'Новая бумага' : 'Новый материал'}</button>
  {#if !isPaper}<div class="reference-filter"><input class="form-control" aria-label="Название материала" placeholder="Введите часть названия" bind:value={filterText} /><select class="form-control" aria-label="Вид работ" bind:value={filterType}><option value="">- Все виды работ -</option>{#each Object.entries(data.metadata.work_types ?? {}) as [value,label]}<option {value}>{label}</option>{/each}</select><button class="btn btn-primary" onclick={() => applyFilter()}>Применить</button><button class="btn btn-default" onclick={() => applyFilter(true)}>Сбросить</button></div>{/if}
  {/if}
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if action === 'delete' && ready}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно' : 'удалить'} {form.title}?</p>{#if form.deleted ? data.can_delete_trashed : data.can_delete}<button class="btn btn-danger" disabled={busy} onclick={confirmDelete}>Удалить</button>{/if} <a class="btn btn-default" href={routeBase}>Отменить</a></div></div>
  {/if}
  {#if ready && action !== 'delete'}
    <form class="reference-form" onsubmit={(event) => { event.preventDefault(); if (data.can_edit) save(); }}>
      <fieldset disabled={!data.can_edit || form.deleted}>
      {#if isPaper}<div class="form-group"><label for="paper_type">Вид бумаги</label><select id="paper_type" class="form-control" bind:value={form.type_id}>{#each data.metadata.types as item}<option value={item.id}>{item.title}</option>{/each}</select></div><div class="form-group"><label for="paper_format">Формат</label><select id="paper_format" class="form-control" bind:value={form.format_id}>{#each data.metadata.formats as item}<option value={item.id}>{item.title}</option>{/each}</select></div><div class="form-group"><label for="paper_weight">Плотность</label><input id="paper_weight" class="form-control" type="number" min="0" bind:value={form.weight} /></div><div class="form-group"><label for="paper_markup">Наценка</label><input id="paper_markup" class="form-control" type="number" min="0" max="100" bind:value={form.markup} /></div>{:else}<div class="form-group"><label for="material_title">Название материала</label><input id="material_title" class="form-control" required bind:value={form.title} /></div><div class="form-group"><label for="material_description">Описание</label><textarea id="material_description" class="form-control" bind:value={form.description}></textarea></div><div class="form-group"><label for="material_measure">Единицы измерения</label><select id="material_measure" class="form-control" bind:value={form.measure_id}>{#each data.metadata.measures as item}<option value={item.id}>{item.title}</option>{/each}</select></div><div class="form-group"><label for="material_work_type">Вид работ</label><select id="material_work_type" class="form-control" bind:value={form.work_type}>{#each Object.entries(data.metadata.work_types) as [value,label]}<option {value}>{label}</option>{/each}</select></div><div class="production-checks"><label><input type="checkbox" bind:checked={form.production_book} /> Книги, брошюры</label><label><input type="checkbox" bind:checked={form.production_poly} /> Полиграфия</label><label><input type="checkbox" bind:checked={form.production_souvenir} /> Сувенирная печать</label><label><input type="checkbox" bind:checked={form.production_wide} /> Широкоформатная печать</label></div>{/if}<button class="btn btn-primary" type="submit" disabled={busy || form.deleted || !data.can_edit}>Сохранить</button> <a class="btn btn-default" href={routeBase}>Отменить</a>
      </fieldset>
    </form>
  {/if}
  {#if action === 'list'}
  <table class="table table-striped table-bordered table-hover"><thead><tr>{#each (isPaper ? [['id','ID'],['title','Название'],['type_id','Вид бумаги'],['weight','Плотность'],['format_id','Формат']] : [['id','ID'],['title','Название'],['measure_id','Единицы'],['work_type','Вид работ']]) as [key,label]}<th><button class="sort-button" onclick={() => changeSort(key)}>{label} {sort === key ? (direction === 'asc' ? '↑' : '↓') : ''}</button></th>{/each}{#if !isPaper}<th>Продукция</th>{/if}<th>Действия</th></tr></thead><tbody>
    {#each data.items as item}<tr class:warning={item.deleted}>{#if isPaper}<td>{item.id}</td><td>{item.title}</td><td>{item.type}</td><td>{item.weight}</td><td>{item.format}</td>{:else}<td>{item.id}</td><td>{item.title}</td><td>{item.measure}</td><td>{item.work_type_title}</td><td>{Object.entries(item.production).filter(([,active]) => active).map(([key]) => ({book:'Книги, брошюры',poly:'Полиграфия',souvenir:'Сувенирная печать',wide:'Широкоформатная печать'})[key]).join('; ')}</td>{/if}<td><a class="btn btn-xs btn-primary" href={`${routeBase}/${item.id}/edit`}>Редактировать</a> {#if item.deleted}{#if data.can_restore}<a class="btn btn-xs btn-info" href={`${routeBase}/${item.id}/restore`}>Восстановить</a>{/if}{#if !isPaper && data.can_delete_trashed}<a class="btn btn-xs btn-danger" href={`${routeBase}/${item.id}/delete`}>Удалить окончательно</a>{/if}{:else}<a class="btn btn-xs btn-danger" href={`${routeBase}/${item.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan="6">Нет записей</td></tr>{/each}
  </tbody></table>
  <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
  {/if}
</div>