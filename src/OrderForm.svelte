<script>
  import { onMount } from 'svelte';
  export let orderType = 'poly';
  export let source = null;
  export let sourceId = null;
  export let onSaved;
  let title = source?.order?.title ?? '';
  let format = source?.order?.format ?? '';
  let printing = source?.order?.printing ?? (orderType === 'wide' ? 1 : 1000);
  let formatSuggestions = [];
  let formatError = '';
  let loadingFormats = false;
  let volume = source?.order?.volume ?? '';
  let total = source?.order?.total ?? '0';
  let width = source?.order?.width ?? '';
  let height = source?.order?.height ?? '';
  let error = '';
  let busy = false;
  let canEdit = false;

  async function loadFormats(prefix = format) {
    if (!['book', 'poly'].includes(orderType)) {
      formatSuggestions = [];
      return;
    }
    loadingFormats = true;
    formatError = '';
    try {
      const response = await fetch(`/api/orders/formats/${orderType}${prefix ? `/${encodeURIComponent(prefix)}` : ''}`);
      if (!response.ok) throw new Error('format lookup failed');
      formatSuggestions = await response.json();
    } catch {
      formatError = 'Не удалось загрузить варианты формата';
    } finally {
      loadingFormats = false;
    }
  }

  onMount(async () => {
    if (sourceId) {
      try {
        const response = await fetch(`/api/orders/${sourceId}`);
        if (!response.ok) throw new Error('Не удалось загрузить заказ');
        source = await response.json();
        canEdit = Boolean(source.permissions?.edit);
        if (!canEdit) throw new Error('Недостаточно прав для копирования заказа');
        orderType = source.order.order_type ?? source.order.type;
        title = source.order.title;
        format = source.order.format;
        printing = source.order.printing;
        volume = source.order.volume ?? '';
        total = source.order.total ?? '0';
        width = source.order.width ?? '';
        height = source.order.height ?? '';
      } catch (failure) { error = failure.message; }
    } else {
      try {
        const response = await fetch(`/api/orders/add/${orderType}`);
        if (!response.ok) throw new Error('Недостаточно прав для создания заказа');
        canEdit = Boolean((await response.json()).permissions?.edit);
      } catch (failure) { error = failure.message; }
    }
    await loadFormats();
  });

  async function submit() {
    if (busy || !canEdit || (sourceId && !source)) return;
    busy = true;
    error = '';
    try {
      const response = sourceId
        ? await fetch(`/api/orders/${sourceId}/copy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, format, printing, volume, total, width, height }) })
        : await fetch(`/api/orders/add/${orderType}`, { method: 'POST', body: new URLSearchParams({ order_title: title, order_format: format, order_printing: printing, order_volume: volume, order_total: total, order_width: width, order_height: height }) });
      const result = await response.json();
      if (!response.ok) throw new Error('Не удалось сохранить заказ');
      onSaved(result.id);
    } catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
</script>

<div class="container-fluid"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="panel panel-default">
  <div class="panel-heading">{source ? 'Копирование заказа' : 'Новый заказ'} <small>({orderType})</small></div>
  <div class="panel-body"><form onsubmit={(event) => { event.preventDefault(); submit(); }}>
    {#if error}<div class="alert alert-danger">{error}</div>{/if}
    <fieldset disabled={!canEdit || busy}>
    {#if orderType === 'book'}<div class="form-group"><label for="order_volume">Объем</label><input class="form-control" id="order_volume" bind:value={volume} /></div>{/if}
    <div class="form-group"><label for="order_total">Стоимость продажи</label><input class="form-control" id="order_total" type="text" inputmode="decimal" bind:value={total} /></div>
    {#if orderType === 'wide'}<div class="row"><div class="col-md-6"><div class="form-group"><label for="order_width">Ширина</label><input class="form-control" id="order_width" type="text" inputmode="decimal" bind:value={width} required /></div></div><div class="col-md-6"><div class="form-group"><label for="order_height">Высота</label><input class="form-control" id="order_height" type="text" inputmode="decimal" bind:value={height} required /></div></div></div>{/if}
    <div class="form-group"><label for="order_title">Название</label><input required class="form-control" id="order_title" bind:value={title} placeholder="Введите название заказа" /></div>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="order_format">Формат</label><input class="form-control" id="order_format" list="order-format-suggestions" bind:value={format} oninput={() => loadFormats(format)} /><datalist id="order-format-suggestions">{#each formatSuggestions as suggestion}<option value={suggestion}></option>{/each}</datalist>{#if loadingFormats}<small class="text-muted">Загрузка вариантов…</small>{:else if formatError}<small class="text-danger">{formatError}</small>{/if}</div></div><div class="col-md-6"><div class="form-group"><label for="order_printing">Тираж</label><input required class="form-control" id="order_printing" type="number" bind:value={printing} /></div></div></div>
    </fieldset>
    <button class="btn btn-default" type="button" onclick={() => history.back()}>Отмена</button> {#if canEdit}<button class="btn btn-primary" type="submit" disabled={busy}>{source ? 'Копировать заказ' : 'Создать заказ'}</button>{/if}
  </form></div>
</div></div></div></div>
