<script>
  import { onMount } from 'svelte';
  export let kind;
  let data = { items: [], page: 1, last_page: 1, metadata: {} };
  let form = null;
  let editing = null;
  let error = '';
  let filterText = '';
  let filterType = '';
  let sort = 'id';
  let direction = 'desc';
  const isPaper = kind === 'paper';
  const base = isPaper ? '/api/references/paper' : '/api/references/materials';
  async function load(page = 1) {
    const query = `?page=${page}&sort=${sort}&order=${direction}`;
    const response = await fetch(base + query);
    if (!response.ok) { error = 'Не удалось загрузить справочник'; return; }
    data = await response.json();
    if (!isPaper && data.filter) { filterText = data.filter.filter_text; filterType = data.filter.filter_type; }
  }
  async function applyFilter(flush = false) {
    const response = await fetch(`${base}/filter`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({filter_text:filterText, filter_type:filterType, flush})});
    if (!response.ok) { error = 'Не удалось применить фильтр'; return; }
    await load(1);
  }
  async function changeSort(field) { direction = sort === field && direction === 'asc' ? 'desc' : 'asc'; sort = field; await load(data.page); }
  function blankPaper() { return { type_id: data.metadata.types?.[0]?.id ?? '', format_id: data.metadata.formats?.[0]?.id ?? '', weight: 80, markup: 10 }; }
  function blankMaterial() { return { title: '', description: '', measure_id: data.metadata.measures?.[0]?.id ?? '', work_type: 'print', production_book: false, production_poly: false, production_souvenir: false, production_wide: false }; }
  async function create() {
    if (isPaper) { const response = await fetch(`${base}/create`, {method: 'POST'}); if (!response.ok) { error = 'Сначала создайте вид и формат бумаги'; return; } const result = await response.json(); editing = result.id; form = blankPaper(); await load(data.page); }
    else { form = blankMaterial(); editing = 'new'; }
  }
  async function save() {
    const url = isPaper ? `${base}/${editing}` : (editing === 'new' ? base : `${base}/${editing}`);
    const response = await fetch(url, {method: editing === 'new' ? 'POST' : 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form)});
    if (!response.ok) { error = 'Проверьте поля формы'; return; }
    editing = null; form = null; await load(data.page);
  }
  async function remove(id) { if (confirm('Удалить запись?')) { await fetch(`${base}/${id}`, {method: 'DELETE'}); await load(data.page); } }
  async function restore(id) { await fetch(`${base}/${id}/restore`, {method: 'POST'}); await load(data.page); }
  function edit(item) {
    editing = item.id;
    form = {...item};
    if (!isPaper) for (const [key, value] of Object.entries(item.production)) form[`production_${key}`] = value;
  }
  onMount(() => load());
</script>

<div class="container-fluid">
  <h1 class="page-header">{isPaper ? 'Бумага' : 'Материалы'}</h1>
  <button class="btn btn-default" onclick={create}>{isPaper ? 'Новая бумага' : 'Новый материал'}</button>
  {#if !isPaper}<div class="reference-filter"><input class="form-control" aria-label="Название материала" placeholder="Введите часть названия" bind:value={filterText} /><select class="form-control" aria-label="Вид работ" bind:value={filterType}><option value="">- Все виды работ -</option>{#each Object.entries(data.metadata.work_types ?? {}) as [value,label]}<option {value}>{label}</option>{/each}</select><button class="btn btn-primary" onclick={() => applyFilter()}>Применить</button><button class="btn btn-default" onclick={() => applyFilter(true)}>Сбросить</button></div>{/if}
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  {#if editing !== null}
    <form class="reference-form" onsubmit={(event) => { event.preventDefault(); save(); }}>
      {#if isPaper}<div class="form-group"><label for="paper_type">Вид бумаги</label><select id="paper_type" class="form-control" bind:value={form.type_id}>{#each data.metadata.types as item}<option value={item.id}>{item.title}</option>{/each}</select></div><div class="form-group"><label for="paper_format">Формат</label><select id="paper_format" class="form-control" bind:value={form.format_id}>{#each data.metadata.formats as item}<option value={item.id}>{item.title}</option>{/each}</select></div><div class="form-group"><label for="paper_weight">Плотность</label><input id="paper_weight" class="form-control" type="number" min="0" bind:value={form.weight} /></div><div class="form-group"><label for="paper_markup">Наценка</label><input id="paper_markup" class="form-control" type="number" min="0" max="100" bind:value={form.markup} /></div>{:else}<div class="form-group"><label for="material_title">Название материала</label><input id="material_title" class="form-control" required bind:value={form.title} /></div><div class="form-group"><label for="material_description">Описание</label><textarea id="material_description" class="form-control" bind:value={form.description}></textarea></div><div class="form-group"><label for="material_measure">Единицы измерения</label><select id="material_measure" class="form-control" bind:value={form.measure_id}>{#each data.metadata.measures as item}<option value={item.id}>{item.title}</option>{/each}</select></div><div class="form-group"><label for="material_work_type">Вид работ</label><select id="material_work_type" class="form-control" bind:value={form.work_type}>{#each Object.entries(data.metadata.work_types) as [value,label]}<option {value}>{label}</option>{/each}</select></div><div class="production-checks"><label><input type="checkbox" bind:checked={form.production_book} /> Книги, брошюры</label><label><input type="checkbox" bind:checked={form.production_poly} /> Полиграфия</label><label><input type="checkbox" bind:checked={form.production_souvenir} /> Сувенирная печать</label><label><input type="checkbox" bind:checked={form.production_wide} /> Широкоформатная печать</label></div>{/if}<button class="btn btn-primary" type="submit">Сохранить</button> <button class="btn btn-default" type="button" onclick={() => (editing = null)}>Отмена</button>
    </form>
  {/if}
  <table class="table table-striped table-bordered table-hover"><thead><tr>{#each (isPaper ? [['id','ID'],['title','Название'],['type_id','Вид бумаги'],['weight','Плотность'],['format_id','Формат']] : [['id','ID'],['title','Название'],['measure_id','Единицы'],['work_type','Вид работ']]) as [key,label]}<th><button class="sort-button" onclick={() => changeSort(key)}>{label} {sort === key ? (direction === 'asc' ? '↑' : '↓') : ''}</button></th>{/each}{#if !isPaper}<th>Продукция</th>{/if}<th>Действия</th></tr></thead><tbody>
    {#each data.items as item}<tr class:warning={item.deleted}>{#if isPaper}<td>{item.id}</td><td>{item.title}</td><td>{item.type}</td><td>{item.weight}</td><td>{item.format}</td>{:else}<td>{item.id}</td><td>{item.title}</td><td>{item.measure}</td><td>{item.work_type_title}</td><td>{Object.entries(item.production).filter(([,active]) => active).map(([key]) => ({book:'Книги, брошюры',poly:'Полиграфия',souvenir:'Сувенирная печать',wide:'Широкоформатная печать'})[key]).join('; ')}</td>{/if}<td>{#if item.deleted}<button class="btn btn-xs btn-info" onclick={() => restore(item.id)}>Восстановить</button>{:else}<button class="btn btn-xs btn-primary" onclick={() => edit(item)}>Редактировать</button> <button class="btn btn-xs btn-danger" onclick={() => remove(item.id)}>Удалить</button>{/if}</td></tr>{:else}<tr><td colspan="6">Нет записей</td></tr>{/each}
  </tbody></table>
  <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
</div>