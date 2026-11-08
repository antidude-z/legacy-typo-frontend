<script>
  import { onMount } from 'svelte';
  export let orderId;
  export let onBack;
  let data = null;
  let title = '';
  let form = { format: '', printing: 0, status_id: 1, order_date: '', prod_date: '', deadline: '', manager_id: '', customer_id: '', bill_id: '', comment: '', files: '' };
  let message = '';
  let history = [];

  async function load() {
    const response = await fetch(`/api/orders/${orderId}`);
    if (response.ok) {
      data = await response.json();
      title = data.order.title;
      form = { ...form, ...data.order, status_id: data.order.status_id ?? 1, manager_id: data.order.manager_id ?? '', customer_id: data.order.customer_id ?? '', bill_id: data.order.bill_id ?? '' };
      const historyResponse = await fetch(`/api/orders/${orderId}/history`);
      if (historyResponse.ok) history = (await historyResponse.json()).items;
    }
  }
  async function save() {
    const response = await fetch(`/api/orders/${orderId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ...form, title, markups: data.markups }) });
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
  <div class="row"><div class="col-sm-12"><form onsubmit={(event) => { event.preventDefault(); save(); }}>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="detail_title">Название</label><input class="form-control" id="detail_title" bind:value={title} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_format">Формат</label><input class="form-control" id="detail_format" bind:value={form.format} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_printing">Тираж</label><input class="form-control" id="detail_printing" type="number" bind:value={form.printing} /></div></div></div>
    <div class="row"><div class="col-md-3"><div class="form-group"><label for="detail_status">Статус заказа</label><select class="form-control" id="detail_status" bind:value={form.status_id}>{#each data.metadata.statuses as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-3"><div class="form-group"><label for="detail_order_date">Дата заказа</label><input class="form-control" id="detail_order_date" type="date" bind:value={form.order_date} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_prod_date">Дата производства</label><input class="form-control" id="detail_prod_date" type="date" bind:value={form.prod_date} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_deadline">Дедлайн</label><input class="form-control" id="detail_deadline" type="date" bind:value={form.deadline} /></div></div></div>
    <div class="row"><div class="col-md-4"><div class="form-group"><label for="detail_manager">Менеджер</label><select class="form-control" id="detail_manager" bind:value={form.manager_id}>{#each data.metadata.managers as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-4"><div class="form-group"><label for="detail_customer">Заказчик</label><select class="form-control" id="detail_customer" bind:value={form.customer_id}><option value="">- Выберите -</option>{#each data.metadata.customers as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-4"><div class="form-group"><label for="detail_bill">Счёт</label><input class="form-control" id="detail_bill" type="number" bind:value={form.bill_id} /></div></div></div>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="detail_files">Файлы</label><textarea class="form-control" id="detail_files" rows="2" bind:value={form.files}></textarea></div></div><div class="col-md-6"><div class="form-group"><label for="detail_comment">Примечания</label><textarea class="form-control" id="detail_comment" rows="2" bind:value={form.comment}></textarea></div></div></div>
    <button class="btn btn-primary" type="submit">Сохранить</button> <button class="btn btn-default" type="button" onclick={onBack}>Назад</button> <button class="btn btn-danger" type="button" onclick={remove}>Удалить</button> {#if message}<span class="save-message">{message}</span>{/if}</form></div></div>
  <div class="row"><div class="col-sm-12"><ul class="nav-tabs-static"><li class="active">Общие сведения</li><li>Дизайн/препресс</li><li>Заготовки</li><li>Сборка</li><li>Прочие работы</li><li>История</li></ul></div></div>
  <div class="row"><div class="col-sm-12"><div class="panel panel-default"><div class="panel-heading">Общие сведения</div><div class="panel-body"><p>Стоимость: {data.calculation.total}</p><p class="text-muted">{data.calculation.message}</p><table class="table table-striped"><thead><tr><th>Состав заказа</th><th>Активна</th><th>Скидка/наценка</th></tr></thead><tbody>{#each data.markups as markup}<tr><td>{markup.type}</td><td><input type="checkbox" checked={markup.active} onchange={(event) => markup.active = event.currentTarget.checked} /></td><td><input class="form-control input-sm" type="number" bind:value={markup.value} /></td></tr>{/each}</tbody></table>{#each Object.entries(data.operations) as [key, items]}<h3>{key}</h3>{#if items.length}<ul>{#each items as item}<li>{item.title} — {item.quantity}</li>{/each}</ul>{:else}<p>Нет записей.</p>{/if}{/each}<h3>История изменений</h3>{#if history.length}<table class="table table-bordered table-striped"><thead><tr><th>Дата</th><th>Сотрудник</th><th>Действие</th></tr></thead><tbody>{#each history as item}<tr><td>{item.date}</td><td>{item.user}</td><td>{item.comment}</td></tr>{/each}</tbody></table>{:else}<p>История изменений пуста.</p>{/if}</div></div></div></div>
</div>
{:else}<div class="container-fluid"><p>Загрузка заказа...</p></div>{/if}
