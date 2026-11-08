<script>
  import { onMount } from 'svelte';
  export let orderId;
  export let onBack;
  let data = null;
  let title = '';
  let message = '';

  async function load() {
    const response = await fetch(`/api/orders/${orderId}`);
    if (response.ok) { data = await response.json(); title = data.order.title; }
  }
  async function save() {
    const response = await fetch(`/api/orders/${orderId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ title }) });
    message = response.ok ? 'Сохранено' : 'Не удалось сохранить';
    await load();
  }
  async function remove() {
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    onBack();
  }
  onMount(load);
</script>

{#if data}
<div class="container-fluid order-detail"><div class="row"><div class="col-sm-12"><h1 class="page-header">{data.order.title} <small>({data.order.type})</small></h1></div></div>
  <div class="row"><div class="col-sm-12"><form onsubmit={(event) => { event.preventDefault(); save(); }}><div class="row"><div class="col-md-6"><div class="form-group"><label for="detail_title">Название</label><input class="form-control" id="detail_title" bind:value={title} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_format">Формат</label><input class="form-control" id="detail_format" value={data.order.format ?? ''} readonly /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_printing">Тираж</label><input class="form-control" id="detail_printing" value={data.order.printing} readonly /></div></div></div><button class="btn btn-primary" type="submit">Сохранить</button> <button class="btn btn-default" type="button" onclick={onBack}>Назад</button> <button class="btn btn-danger" type="button" onclick={remove}>Удалить</button> {#if message}<span class="save-message">{message}</span>{/if}</form></div></div>
  <div class="row"><div class="col-sm-12"><ul class="nav-tabs-static"><li class="active">Общие сведения</li><li>Дизайн/препресс</li><li>Заготовки</li><li>Сборка</li><li>Прочие работы</li><li>История</li></ul></div></div>
  <div class="row"><div class="col-sm-12"><div class="panel panel-default"><div class="panel-heading">Операции заказа</div><div class="panel-body"><p>Стоимость: {data.calculation.total}</p><p class="text-muted">{data.calculation.message}</p>{#each Object.entries(data.operations) as [key, items]}<h3>{key}</h3>{#if items.length}<ul>{#each items as item}<li>{item.title} — {item.quantity}</li>{/each}</ul>{:else}<p>Нет записей.</p>{/if}{/each}</div></div></div></div>
</div>
{:else}<div class="container-fluid"><p>Загрузка заказа...</p></div>{/if}
