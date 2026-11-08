<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  import { displayDate, isoDate } from './pricing.js';
  export let billId;
  export let identity = null;
  export let action = 'edit';
  let data = null;
  let form = null;
  let calendarDate = '';
  let error = '';
  let busy = false;
  const base = `/accounting/bills/${billId}`;
  const collection = `/api${base}/payments`;
  async function request(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(response.status === 422 && typeof result.detail === 'string' ? result.detail : inventoryError(response.status));
    return result;
  }
  async function submit() {
    if (busy) return;
    busy = true; error = '';
    try {
      if (action !== 'delete' && !isoDate(form.payment_date)) throw new Error('Введите дату в формате ДД.ММ.ГГГГ.');
      const result = await request(action === 'create' ? collection : `${collection}/${identity}`, {
        method:action === 'create' ? 'POST' : action === 'delete' ? 'DELETE' : 'PATCH',
        headers:{'Content-Type':'application/json'},
        ...(action === 'delete' ? {} : {body:JSON.stringify(form)})
      });
      window.location.href = action === 'delete' ? base : result.location;
    } catch (failure) { error = failure.message || inventoryError(0); }
    finally { busy = false; }
  }
  onMount(async () => {
    try {
      if (action === 'show') { window.location.replace(`${base}/payments/${identity}/edit`); return; }
      if (action === 'restore') { await request(`${collection}/${identity}/restore`, {method:'POST'}); window.location.replace(base); return; }
      data = await request(action === 'create' ? `${collection}/form` : `${collection}/${identity}`);
      calendarDate = data.item.payment_date;
      form = {...data.item,payment_date:displayDate(calendarDate)};
    } catch (failure) { error = failure.message || inventoryError(0); }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{action === 'create' ? 'Новый платеж' : action === 'delete' ? 'Подтверждение действия' : 'Редактирование платежа'} <small>Счет № {data?.bill.number ?? ''}</small></h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if form && action === 'delete'}
    <div class="panel panel-default"><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно' : 'удалить'} платеж {form.amount} от {form.payment_date}?</p>
      {#if data.can_edit && (!form.deleted || data.can_delete_trashed)}<button class="btn btn-danger" disabled={busy} onclick={submit}>Удалить</button>{/if} <a class="btn btn-default" href={base}>Отменить</a>
    </div></div>
  {:else if form}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault(); submit();}}>
      <fieldset disabled={busy || form.deleted || data.bill.deleted || !data.can_edit}>
        <div class="form-group"><label for="payment_amount">Сумма платежа</label><input id="payment_amount" name="payment_amount" class="form-control" required bind:value={form.amount} /></div>
        <div class="form-group"><label for="payment_date">Дата платежа</label><input id="payment_date" name="payment_date" class="form-control" required placeholder="ДД.ММ.ГГГГ" bind:value={form.payment_date} onchange={() => {calendarDate = isoDate(form.payment_date);}} /><input type="date" aria-label="Выбрать дату платежа" bind:value={calendarDate} onchange={() => {form.payment_date = displayDate(calendarDate);}} /></div>
        <button class="btn btn-primary" type="submit">Сохранить</button>
      </fieldset><a class="btn btn-default" href={base}>Отменить</a>
    </form>
  {:else if !error}<p role="status">Загрузка платежа…</p>{/if}
</div>