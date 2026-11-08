<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  export let identity = null;
  export let paramId = null;
  let data = {items:[],params:[],statuses:[],page:1,last_page:1};
  let form = null;
  let error = '';
  let busy = false;
  const base = '/options/reports';
  const api = '/api/report-settings';
  async function request(url,options) {
    const response = await fetch(url,options); const result = await response.json();
    if (!response.ok) throw new Error(response.status === 422 ? 'Проверьте поля формы.' : inventoryError(response.status));
    return result;
  }
  async function load(page=1) {
    try { data = await request(`${api}?page=${page}`); }
    catch (failure) { error=failure.message; }
  }
  async function save() {
    if (busy) return; busy=true; error='';
    try {
      await request(paramId ? `${api}/${identity}/params/${paramId}` : `${api}/${identity}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      window.location.href=paramId ? `${base}/${identity}/edit` : base;
    } catch (failure) { error=failure.message; }
    finally { busy=false; }
  }
  onMount(async () => {
    try {
      if (!identity) {await load();return;}
      data={...data,...await request(paramId ? `${api}/${identity}/params/${paramId}` : `${api}/${identity}`)};
      form={...data.item};
    } catch (failure) {error=failure.message;}
  });
</script>
<div class="container-fluid">
  <h1 class="page-header">{identity ? form?.title ?? 'Шаблон документа' : 'Шаблоны документов'}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if !identity}
    <table class="table table-striped table-bordered"><thead><tr><th>ID</th><th>Название</th><th>Источник данных</th><th>Формат</th><th>Ориентация</th><th>Тип файла</th><th>Форма</th><th>Действия</th></tr></thead><tbody>{#each data.items as row}<tr><td>{row.id}</td><td>{row.title}</td><td>{row.model_title}</td><td>{row.format}</td><td>{row.orientation}</td><td>{row.kind}</td><td>{row.form ? 'Да':'Нет'}</td><td><a href={`${base}/${row.id}/edit`}>Редактировать</a></td></tr>{:else}<tr><td colspan="8">Нет шаблонов документов</td></tr>{/each}</tbody></table>
    <button class="btn btn-default" disabled={data.page<=1} onclick={() => load(data.page-1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page>=data.last_page} onclick={() => load(data.page+1)}>›</button>
  {:else if form}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault();save();}}>
      <label for="report_title">Название</label><input id="report_title" class="form-control" required bind:value={form.title} />
      {#if paramId}<label for="report_value">Значение</label><textarea id="report_value" class="form-control" required rows="8" bind:value={form.value}></textarea>
      {:else}
        <label for="report_source">Источник данных</label><input id="report_source" class="form-control" readonly value={form.model_title} />
        <label for="report_format">Формат</label><select id="report_format" class="form-control" bind:value={form.format}><option>A4</option><option>A3</option></select>
        <label for="report_orientation">Ориентация</label><select id="report_orientation" class="form-control" bind:value={form.orientation}><option value="P">Портрет</option><option value="L">Ландшафт</option></select>
        <label><input type="checkbox" bind:checked={form.download} /> Скачивать документ</label>
        <p>Не формировать отчет при статусах</p>{#each data.statuses as status}<label><input type="checkbox" value={String(status.id)} bind:group={form.prohibitions} /> {status.title}</label>{/each}
      {/if}
      <button class="btn btn-primary" type="submit" disabled={busy}>Сохранить</button> <a class="btn btn-default" href={paramId ? `${base}/${identity}/edit` : base}>Отменить</a>
    </form>
    {#if !paramId}<h2>Переменные шаблона</h2><table class="table table-bordered"><thead><tr><th>ID</th><th>Алиас</th><th>Название</th><th>Значение</th><th>Действия</th></tr></thead><tbody>{#each data.params as row}<tr><td>{row.id}</td><td>{row.alias}</td><td>{row.title}</td><td>{row.value}</td><td><a href={`${base}/${identity}/params/${row.id}/edit`}>Редактировать</a></td></tr>{:else}<tr><td colspan="5">У документа нет переменных</td></tr>{/each}</tbody></table>{/if}
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>