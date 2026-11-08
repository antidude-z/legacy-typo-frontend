<script>
  export let orderType = 'poly';
  export let source = null;
  export let onSaved;
  let title = source?.order?.title ?? '';
  let format = source?.order?.format ?? '';
  let printing = source?.order?.printing ?? (orderType === 'wide' ? 1 : 1000);

  async function submit() {
    const response = await fetch(`/api/orders/add/${orderType}`, { method: 'POST', body: new URLSearchParams({ order_title: title, order_format: format, order_printing: printing }) });
    const result = await response.json();
    if (response.ok) onSaved(result.id);
  }
</script>

<div class="container-fluid"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="panel panel-default">
  <div class="panel-heading">{source ? 'Копирование заказа' : 'Новый заказ'} <small>({orderType})</small></div>
  <div class="panel-body"><form onsubmit={(event) => { event.preventDefault(); submit(); }}>
    <div class="form-group"><label for="order_title">Название</label><input required class="form-control" id="order_title" bind:value={title} placeholder="Введите название заказа" /></div>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="order_format">Формат</label><input class="form-control" id="order_format" bind:value={format} /></div></div><div class="col-md-6"><div class="form-group"><label for="order_printing">Тираж</label><input required class="form-control" id="order_printing" type="number" bind:value={printing} /></div></div></div>
    <button class="btn btn-default" type="button" onclick={() => history.back()}>Отмена</button> <button class="btn btn-primary" type="submit">{source ? 'Копировать заказ' : 'Создать заказ'}</button>
  </form></div>
</div></div></div></div>
