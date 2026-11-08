<script>
  import { onMount } from 'svelte';

  export let onUnauthenticated;
  let data = { items: [], pagination: { page: 1, per_page: 30, total: 0, last_page: 1 }, metadata: { statuses: [], managers: [], customers: [], types: [] }, filter: {} };
  let filterOpen = false;
  let form = { filter_status: [], filter_date_from: '', filter_date_to: '', filter_number: '', filter_bill: '', filter_manager: '', filter_customer: '', filter_type: '', filter_text: '' };

  async function load(query = '') {
    const response = await fetch(`/api/orders${query}`);
    if (response.status === 303 || response.status === 401) return onUnauthenticated();
    data = await response.json();
    form = { ...form, ...data.filter };
  }

  async function applyFilter(flush = false) {
    const body = new URLSearchParams();
    if (flush) body.set('flush', 'flush');
    else {
      for (const [key, value] of Object.entries(form)) {
        if (Array.isArray(value)) value.forEach((entry) => body.append(key, entry));
        else if (value) body.set(key, value);
      }
    }
    await fetch('/api/orders/filter', { method: 'POST', body });
    await load();
  }

  function sortBy(column) {
    const direction = data.sort === column && data.order === 'asc' ? 'desc' : 'asc';
    load(`?sort=${column}&order=${direction}&per_page=${data.pagination.per_page}`);
  }

  function page(number) {
    load(`?page=${number}&per_page=${data.pagination.per_page}&sort=${data.sort}&order=${data.order}`);
  }

  onMount(load);
</script>

<div class="container-fluid orders-page">
  <div class="row"><div class="col-sm-12"><h1 class="page-header">Заказы</h1></div></div>
  <div class="row"><div class="col-sm-12">
    <div class="btn-group"><button class="btn btn-default dropdown-toggle" onclick={() => (filterOpen = !filterOpen)}>＋ Новый заказ <span class="caret">▼</span></button>
      {#if filterOpen}<ul class="dropdown-menu order-create-menu"><li><a href="/orders/add/book">Книги, брошюры</a></li><li><a href="/orders/add/poly">Полиграфия</a></li><li><a href="/orders/add/wide">Ш/ф печать, стенды</a></li></ul>{/if}
    </div>
  </div></div>
  <div class="row spacer"><div class="col-sm-12">&nbsp;</div></div>
  <div class="row"><div class="col-sm-12"><div class="panel panel-default">
    <div class="panel-heading"><button class="panel-title filter-toggle" onclick={() => (filterOpen = !filterOpen)}>⌕ Поиск-фильтр</button></div>
    {#if filterOpen}<div class="panel-body"><form onsubmit={(event) => { event.preventDefault(); applyFilter(); }}>
      <div class="row">
        <div class="col-sm-4"><label>Менеджер<select class="form-control input-sm" bind:value={form.filter_manager}><option value="">- Все -</option>{#each data.metadata.managers as item}<option value={item.id}>{item.title}</option>{/each}</select></label><label>Заказчик<select class="form-control input-sm" bind:value={form.filter_customer}><option value="">- Все -</option>{#each data.metadata.customers as item}<option value={item.id}>{item.title}</option>{/each}</select></label></div>
        <div class="col-sm-4"><div class="row"><div class="col-sm-6"><label>Дата заказа, с<input class="form-control input-sm" type="date" bind:value={form.filter_date_from} /></label></div><div class="col-sm-6"><label>По<input class="form-control input-sm" type="date" bind:value={form.filter_date_to} /></label></div></div><div class="row"><div class="col-sm-6"><label>Номер заказа<input class="form-control input-sm" placeholder="Введите часть номера" bind:value={form.filter_number} /></label></div><div class="col-sm-6"><label>Номер счета<input class="form-control input-sm" placeholder="Введите часть номера" bind:value={form.filter_bill} /></label></div></div></div>
        <div class="col-sm-4"><div class="field-label">Статусы</div><div class="status-grid">{#each data.metadata.statuses as item}<label><input type="checkbox" value={item.id} checked={form.filter_status?.includes(item.id)} onchange={(event) => form.filter_status = event.currentTarget.checked ? [...form.filter_status, item.id] : form.filter_status.filter((id) => id !== item.id)} /> {item.title}</label>{/each}</div></div>
      </div>
      <div class="row"><div class="col-sm-4"><label>Тип заказа<select class="form-control input-sm" bind:value={form.filter_type}><option value="">- Все -</option>{#each data.metadata.types as item}<option value={item.id}>{item.title}</option>{/each}</select></label></div><div class="col-sm-4"><label>Название<input class="form-control input-sm" placeholder="Введите часть названия" bind:value={form.filter_text} /></label></div><div class="col-sm-4 filter-actions"><button class="btn btn-primary btn-sm" type="submit">Применить</button> <button class="btn btn-default btn-sm" type="button" onclick={() => applyFilter(true)}>Сбросить</button></div></div>
    </form></div>{/if}
  </div></div></div>
  <div class="row"><div class="col-sm-12"><div class="table-responsive"><table class="table table-striped table-bordered table-hover"><thead><tr>
    {#each [['id','№'],['title','Название'],['order_type','Тип заказа'],['bill_id','Счет'],['user_id','Менеджер'],['customer_id','Заказчик'],['status_id','Статус'],['printing','Тираж'],['order_date','Дата создания'],['total','Стоимость']] as column}<th><button class="sort-button" onclick={() => sortBy(column[0])}>{column[1]} {#if data.sort === column[0]}{data.order === 'asc' ? '↑' : '↓'}{/if}</button></th>{/each}<th class="actions-column">Действия</th>
  </tr></thead><tbody>{#each data.items as item}<tr class:warning={item.deleted}><td>{item.id}</td><td><a href={`/orders/${item.id}`}>{item.title}</a>{#if item.deleted} (удалено){/if}</td><td>{item.type}</td><td>{item.bill?.number ?? ''}</td><td>{item.manager}</td><td>{item.customer}</td><td>{item.status}</td><td class="text-center">{item.printing}</td><td class="text-center">{item.order_date ?? ''}</td><td class="text-right">{item.total}</td><td><a class="btn btn-xs btn-primary" href={`/orders/${item.id}`}>✎</a></td></tr>{:else}<tr><td colspan="11">Нет заказов</td></tr>{/each}</tbody></table></div>
    <div class="pagination-controls"><button class="btn btn-default btn-sm" disabled={data.pagination.page <= 1} onclick={() => page(data.pagination.page - 1)}>‹</button><span>Страница {data.pagination.page} из {data.pagination.last_page}</span><button class="btn btn-default btn-sm" disabled={data.pagination.page >= data.pagination.last_page} onclick={() => page(data.pagination.page + 1)}>›</button></div>
  </div></div>
</div>
