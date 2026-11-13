<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  import { displayDate } from './pricing.js';
  import { paymentEditorPath } from './accountingRoutes.js';
  import { safeDestination, orderEditPath } from './navigation.js';
  import { money, billEditPath } from './accounting.js';
  import ReportActions from './ReportActions.svelte';
  import BillOrderReports from './BillOrderReports.svelte';
  export let identity = null;
  export let action = 'list';
  let data = {items:[],metadata:{managers:[],payers:[]},page:1,last_page:1};
  let form = null;
  let filters = {filter_manager:'',filter_payer:'',filter_text:'',filter_date_from:'',filter_date_to:''};
  let error = '';
  let busy = false;
  let sort = 'id';
  let order = 'desc';
  const base = '/accounting/bills';
  const api = '/api/accounting/bills';
  const returnTo = safeDestination(new URLSearchParams(window.location.search).get('destination'), base, window.location.origin);
  const initialQuery = new URLSearchParams(window.location.search);
  const perPage = Math.max(1, Number(initialQuery.get('per_page')) || 30);
  const statusNames = [['paid','Оплачен'],['closed','Закрыт'],['filed','Подшит']];
  async function request(url, options) {
    const response = await fetch(url,options); const result = await response.json();
    if (!response.ok) throw new Error(response.status === 422 && typeof result.detail === 'string' ? result.detail : inventoryError(response.status));
    return result;
  }
  async function load(page = 1) {
    try { data = await request(`${api}?page=${page}&per_page=${perPage}&sort=${sort}&order=${order}`); filters = {...filters,...data.filter}; error = ''; window.history.replaceState(null,'',`${base}?page=${page}&per_page=${perPage}&sort=${sort}&order=${order}`); }
    catch (failure) { error = failure.message; }
  }
  async function sortBy(key) { order = sort === key && order === 'asc' ? 'desc' : 'asc'; sort = key; await load(data.page); }
  async function filter(flush = false) {
    try { await request(`${api}/filter`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...filters,flush})}); if (flush) filters = {filter_manager:'',filter_payer:'',filter_text:'',filter_date_from:'',filter_date_to:''}; await load(); }
    catch (failure) { error = failure.message; }
  }
  async function save() {
    if (busy) return; busy = true; error = '';
    try { await request(action === 'create' ? api : `${api}/${identity}`,{method:action === 'create' ? 'POST':'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); window.location.href = returnTo; }
    catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  async function openPayment(paymentId = 'new') {
    if (busy) return;
    busy = true; error = '';
    try {
      const next = paymentEditorPath(identity, paymentId);
      if (action === 'edit') {
        await request(`${api}/${identity}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      }
      window.location.href = next;
    } catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  async function remove() {
    if (busy) return; busy = true;
    try { await request(`${api}/${identity}`,{method:'DELETE'}); window.location.href = base; }
    catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  onMount(async () => {
    try {
      if (action === 'list') { sort = initialQuery.get('sort') || 'id'; order = initialQuery.get('order') === 'asc' ? 'asc' : 'desc'; await load(Math.max(1,Number(initialQuery.get('page')) || 1)); return; }
      if (action === 'restore') { await request(`${api}/${identity}/restore`,{method:'POST'}); window.location.replace(base); return; }
      if (action === 'create') {
        data = {...data,...await request(`${api}/form`)};
        form = {number:'',bill_date:new Date().toISOString().slice(0,10),user_id:data.metadata.managers[0]?.id ?? 0,payer_id:0,amount:'0',currency:'RUB',paid:false,closed:false,filed:false};
      } else { data = {...data,...await request(`${api}/${identity}`)}; form = {...data.item}; }
    } catch (failure) { error = failure.message; }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{action === 'list' ? 'Счета' : action === 'create' ? 'Новый счет' : `Счет № ${form?.number ?? ''}`}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if action === 'list'}
    {#if data.can_edit}<a class="btn btn-default" href={`${base}/create`}>Новый счет</a>{/if}
    <details open={Object.values(data.filter ?? {}).some(Boolean)}><summary>Поиск-фильтр</summary>
      <form class="reference-form" onsubmit={(event) => {event.preventDefault(); filter();}}>
        <label for="bill_filter_manager">Менеджер</label><select id="bill_filter_manager" class="form-control" bind:value={filters.filter_manager}><option value="">- Все -</option>{#each data.metadata.managers as row}<option value={row.id}>{row.title}</option>{/each}</select>
        <label for="bill_filter_payer">Плательщик</label><select id="bill_filter_payer" class="form-control" bind:value={filters.filter_payer}><option value="">- Все -</option>{#each data.metadata.payers as row}<option value={row.id}>{row.title}</option>{/each}</select>
        <label for="bill_filter_from">Дата счета, с</label><input id="bill_filter_from" class="form-control" type="date" bind:value={filters.filter_date_from} />
        <label for="bill_filter_to">По</label><input id="bill_filter_to" class="form-control" type="date" bind:value={filters.filter_date_to} />
        <label for="bill_filter_text">Номер счета</label><input id="bill_filter_text" class="form-control" bind:value={filters.filter_text} />
        <button class="btn btn-primary" type="submit">Применить</button> <button class="btn btn-default" type="button" onclick={() => filter(true)}>Сбросить</button>
      </form>
    </details>
    <table class="table table-striped table-bordered table-hover"><thead><tr>{#each [['id','ID'],['number','Номер счета'],['bill_date','Дата счета'],['payer_id','Плательщик'],['user_id','Менеджер'],['amount','Сумма']] as [key,label]}<th><button class="sort-button" onclick={() => sortBy(key)}>{label}</button></th>{/each}<th>Оплачено</th><th>Валюта</th><th>Состояние</th><th>Действия</th></tr></thead><tbody>
      {#each data.items as row}<tr class:warning={row.deleted}><td>{row.id}</td><td><a href={`${base}/${row.id}`}>{row.number}</a>{#if row.deleted} (удалено){/if}</td><td>{displayDate(row.bill_date)}</td><td>{row.payer}</td><td>{row.manager}</td><td>{row.amount}</td><td>{row.paid_sum}</td><td>{row.currency}</td><td>{statusNames.filter(([key]) => row[key]).map(([,label]) => label).join('; ')}</td><td>{#if data.can_edit}<a href={`${base}/${row.id}/edit?destination=${encodeURIComponent(window.location.pathname + window.location.search)}`}>Редактировать</a> {#if row.deleted}{#if data.can_restore}<a href={`${base}/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a href={`${base}/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else}<a href={`${base}/${row.id}/delete`}>Удалить</a>{/if}{/if}</td></tr>{:else}<tr><td colspan="10">Нет счетов</td></tr>{/each}
    </tbody></table>
    <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page-1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page+1)}>›</button>
  {:else if form && action === 'delete'}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно':'удалить'} счет № {form.number}?</p><button class="btn btn-danger" disabled={busy || !data.can_edit} onclick={remove}>Удалить</button> <a class="btn btn-default" href={base}>Отменить</a></div></div>
  {:else if form}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault(); save();}}><fieldset disabled={busy || form.deleted || (action !== 'create' && (action !== 'edit' || !data.can_edit))}>
      <label for="bill_number">Номер счета</label><input id="bill_number" class="form-control" required maxlength="20" bind:value={form.number} />
      <label for="bill_date">Дата счета</label><input id="bill_date" class="form-control" type="date" required bind:value={form.bill_date} />
      <label for="bill_manager">Менеджер заказа</label><select id="bill_manager" class="form-control" bind:value={form.user_id}><option value={0}>- Выберите -</option>{#each data.metadata.managers as row}<option value={row.id}>{row.title}</option>{/each}</select>
      <label for="bill_payer">Плательщик</label><select id="bill_payer" class="form-control" bind:value={form.payer_id}><option value={0}>- Выберите -</option>{#each data.metadata.payers as row}<option value={row.id}>{row.title}</option>{/each}</select>
      <label for="bill_amount">Сумма счета</label><input id="bill_amount" class="form-control" required bind:value={form.amount} />
      <label for="bill_currency">Валюта</label><select id="bill_currency" class="form-control" bind:value={form.currency}><option>RUB</option><option>USD</option><option>EUR</option></select>
      {#each statusNames as [key,label]}<label><input type="checkbox" bind:checked={form[key]} /> {label}</label>{/each}
      {#if action === 'edit' || action === 'create'}<button class="btn btn-primary" type="submit">Сохранить</button>{/if}
    </fieldset><a class="btn btn-default" href={returnTo}>Вернуться</a></form>
    {#if action !== 'create'}
      <ReportActions kind="bills" {identity} />
      {#if action === 'view'}<BillOrderReports billId={identity} />{/if}
      {#if action === 'view' && data.can_edit && !form.deleted}<a class="btn btn-primary" href={billEditPath(identity,returnTo)}>Редактировать</a>{/if}
      <h2>Заказы</h2><table class="table table-bordered"><thead><tr><th>№</th><th>Товары (работы, услуги)</th><th>Кол-во</th><th>Ед</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>{#each data.orders as row}<tr><td>{row.id}</td><td>{#if row.url}<a href={orderEditPath(row.id, window.location.pathname + window.location.search)}>{row.title}</a>{:else}{row.title} <span class="text-muted">(заказ недоступен)</span>{/if}</td><td>{row.printing}</td><td>шт</td><td>{money(row.price)}</td><td>{money(row.total)}</td></tr>{:else}<tr><td colspan="6">Заказы не привязаны</td></tr>{/each}</tbody><tfoot><tr><th colspan="5" class="text-right">Итого:</th><th>{money(data.orders_total)}</th></tr></tfoot></table>
      <h2>Платежи по счету</h2>
      {#if action === 'edit' && data.can_edit && !form.deleted}<button class="btn btn-default" type="button" disabled={busy} onclick={() => openPayment()}>Новый платеж</button>{/if}
      <table class="table table-bordered"><thead><tr><th>ID</th><th>Дата платежа</th><th>Сумма</th><th>Действия</th></tr></thead><tbody>{#each data.payments as row}<tr class:warning={row.deleted}><td>{row.id}{#if row.deleted} (удалено){/if}</td><td>{displayDate(row.payment_date)}</td><td>{money(row.amount)}</td><td>
        {#if action === 'edit' && data.can_edit}
          {#if !row.deleted && !form.deleted}<button class="btn btn-xs btn-primary" disabled={busy} onclick={() => openPayment(row.id)}>Редактировать</button>{/if}
          {#if row.deleted}{#if data.can_restore}<a class="btn btn-xs btn-info" href={`${base}/${identity}/payments/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a class="btn btn-xs btn-danger" href={`${base}/${identity}/payments/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else}<a class="btn btn-xs btn-danger" href={`${base}/${identity}/payments/${row.id}/delete`}>Удалить</a>{/if}
        {/if}
      </td></tr>{:else}<tr><td colspan="4">Нет платежей</td></tr>{/each}</tbody></table><p>Итого оплачено: {money(form.paid_sum)}</p>
    {/if}
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>