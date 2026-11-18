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
  let error = '';
  let busy = false;

  async function loadFormats(prefix = format) {
    if (!['book', 'poly'].includes(orderType)) {
      formatSuggestions = [];
      return;
    }
    loadingFormats = true;
    formatError = '';
    try {
      const response = await fetch(`/api/orders/formats/${orderType}/${encodeURIComponent(prefix)}`);
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
        orderType = source.order.order_type ?? source.order.type;
        title = source.order.title;
        format = source.order.format;
        printing = source.order.printing;
        volume = source.order.volume ?? '';
      } catch (failure) { error = failure.message; }
    }
    await loadFormats();
  });

  async function submit() {
    if (busy || (sourceId && !source)) return;
    busy = true;
    error = '';
    try {
      const response = sourceId
        ? await fetch(`/api/orders/${sourceId}/copy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, format, printing, volume }) })
        : await fetch(`/api/orders/add/${orderType}`, { method: 'POST', body: new URLSearchParams({ order_title: title, order_format: format, order_printing: printing, order_volume: volume }) });
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
    {#if orderType === 'book'}<div class="form-group"><label for="order_volume">Объем</label><input class="form-control" id="order_volume" bind:value={volume} /></div>{/if}
    <div class="form-group"><label for="order_title">Название</label><input required class="form-control" id="order_title" bind:value={title} placeholder="Введите название заказа" /></div>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="order_format">Формат</label><input class="form-control" id="order_format" list="order-format-suggestions" bind:value={format} oninput={() => loadFormats(format)} /><datalist id="order-format-suggestions">{#each formatSuggestions as suggestion}<option value={suggestion}></option>{/each}</datalist>{#if loadingFormats}<small class="text-muted">Загрузка вариантов…</small>{:else if formatError}<small class="text-danger">{formatError}</small>{/if}</div></div><div class="col-md-6"><div class="form-group"><label for="order_printing">Тираж</label><input required class="form-control" id="order_printing" type="number" bind:value={printing} /></div></div></div>
    <button class="btn btn-default" type="button" onclick={() => history.back()}>Отмена</button> <button class="btn btn-primary" type="submit">{source ? 'Копировать заказ' : 'Создать заказ'}</button>
  </form></div>
</div></div></div></div>
