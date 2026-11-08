<script>
  import { onMount } from 'svelte';
  import { displayDate, isoDate, stepQuantity, priceError } from './pricing.js';
  export let kind;
  export let itemId;
  export let priceId = null;
  export let action = 'edit';
  let data = null;
  let error = '';
  let form = {};
  let busy = false;
  let calendarDate = '';
  const base = `/prices/${kind}/${itemId}/`;
  const api = `/api/prices/${kind}/${itemId}`;
  const fromList = new URLSearchParams(window.location.search).get('from') === 'list';
  onMount(async () => {
    try {
    if (action === 'create') {
      const response = await fetch(`${api}/create`, { method: 'POST' });
      if (!response.ok) { error = priceError(response.status); return; }
      const price = await response.json();
      window.location.replace(`${base}${price.id}/edit?from=${fromList ? 'list' : 'index'}`);
      return;
    }
    const response = await fetch(`${api}/records/${priceId}`);
    if (!response.ok) { error = priceError(response.status); return; }
    data = await response.json();
    form = { ...data.price, actual_since: displayDate(data.price.actual_since) };
    calendarDate = data.price.actual_since;
    } catch { error = priceError(0); }
  });
  async function submit() {
    if (busy) return;
    if (action !== 'delete' && !isoDate(form.actual_since)) { error = 'Введите корректную дату в формате ДД.ММ.ГГГГ.'; return; }
    busy = true;
    error = '';
    try {
    const response = await fetch(`${api}/records/${priceId}`, {
      method: action === 'delete' ? 'DELETE' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      ...(action === 'delete' ? {} : { body: JSON.stringify(form) })
    });
    if (!response.ok) { error = priceError(response.status); return; }
    window.location.href = action !== 'delete' && fromList ? `/prices/${kind}/` : base;
    } catch { error = priceError(0); }
    finally { busy = false; }
  }
</script>

<div class="container-fluid">
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  {#if data}
    {#if action === 'delete'}
      <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body">
        {#if data.can_delete}<p>Вы действительно хотите удалить цену {data.price.amount} {data.price.currency} ({data.title})?</p><button class="btn btn-danger" disabled={busy} onclick={submit}>Удалить</button>{:else}<p>Цену нельзя удалить</p>{/if}
        <a class="btn btn-default" href={base}>Отменить</a>
      </div></div>
    {:else}
      <h1 class="page-header">{data.heading} <small>({data.title})</small></h1>
      <form autocomplete="off" onsubmit={(event) => { event.preventDefault(); submit(); }}>
        <fieldset disabled={busy || !data.can_edit}>
        <div class="form-group"><label for="amount">Цена</label><input id="amount" class="form-control" required bind:value={form.amount} /></div>
        <div class="form-group"><label for="currency">Валюта</label><select id="currency" class="form-control" bind:value={form.currency}><option>RUB</option><option>USD</option><option>EUR</option></select></div>
        <div class="form-group"><label for="since">Цена действительна с даты</label><input id="since" class="form-control" placeholder="ДД.ММ.ГГГГ" required bind:value={form.actual_since} onchange={() => { calendarDate = isoDate(form.actual_since); }} /><label for="price_calendar" class="sr-only">Выбрать дату в календаре</label><input id="price_calendar" type="date" aria-label="Выбрать дату в календаре" bind:value={calendarDate} onchange={() => { form.actual_since = displayDate(calendarDate); }} /></div>
        <div class="form-group"><label for="threshold">Цена действительна от</label><div class="pricing-spinner"><button class="btn btn-default" type="button" aria-label="Уменьшить количество на 10" onclick={() => { form.actual_from = stepQuantity(form.actual_from, -1); }}>−</button><input id="threshold" class="form-control" type="number" min="0" max="10000" step="1" required bind:value={form.actual_from} /><button class="btn btn-default" type="button" aria-label="Увеличить количество на 10" onclick={() => { form.actual_from = stepQuantity(form.actual_from, 1); }}>+</button></div></div>
        <button class="btn btn-primary" type="submit">{busy ? 'Сохранение…' : 'Сохранить'}</button>
        </fieldset>
        <a class="btn btn-default" href={base}>Отменить</a>
      </form>
    {/if}
  {/if}
  {#if !data && !error}<p role="status">Загрузка цены…</p>{/if}
</div>