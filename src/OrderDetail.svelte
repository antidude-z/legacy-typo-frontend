<script>
  import { onMount } from 'svelte';
  import Calculation from './Calculation.svelte';
  import BillSelector from './BillSelector.svelte';
  import ReportActions from './ReportActions.svelte';
  import OrderOperations from './OrderOperations.svelte';
  import { safeDestination } from './navigation.js';
  export let orderId;
  export let onBack;
  let data = null;
  let title = '';
  let form = { format: '', printing: 0, status_id: 1, order_date: '', prod_date: '', deadline: '', manager_id: '', customer_id: '', bill_id: '', comment: '', files: '' };
  let message = '';
  let history = [];
  let blanks = { items: [], metadata: { printers: [], papers: [], materials: [], printer_processes: [] } };
  let blankForm = { title: '', printer_id: 0, printer_process_id: '', paper_id: '', material_id: '', colors_front: 1, colors_back: 0, cutting: 1, details_per_sheet: 0, pages_per_sheet: 0, details_per_blank: 1, different_details: 1, comments: '', plates: 0, self_print: false, fix_plates: false, afterprints: [] };
  let editingBlank = null;
  let selectedBill = null;
  let saving = false;
  const destination = safeDestination(new URLSearchParams(window.location.search).get('destination'), '/orders', window.location.origin);

  async function load() {
    const response = await fetch(`/api/orders/${orderId}`);
    if (response.ok) {
      data = await response.json();
      title = data.order.title;
      selectedBill = data.order.bill;
      form = { ...form, ...data.order, status_id: data.order.status_id ?? 1, manager_id: data.order.manager_id ?? '', customer_id: data.order.customer_id ?? '', bill_id: data.order.bill_id ?? '' };
      const historyResponse = await fetch(`/api/orders/${orderId}/history`);
      if (historyResponse.ok) history = (await historyResponse.json()).items;
      const blanksResponse = await fetch(`/api/orders/${orderId}/blanks`);
      if (blanksResponse.ok) blanks = await blanksResponse.json();
    }
  }
  async function save() {
    if (saving) return;
    saving = true;
    try {
      const response = await fetch(`/api/orders/${orderId}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ...form, user_id:form.manager_id || null, customer_id:form.customer_id || null, bill_id:form.bill_id || null, title, markups: data.markups }) });
      if (!response.ok) { message = 'Не удалось сохранить'; return; }
      window.location.href = destination;
    } catch { message = 'Ошибка соединения. Изменения не сохранены.'; }
    finally { saving = false; }
  }
  async function remove() {
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    onBack();
  }
  async function addBlank() {
    const url = editingBlank ? `/api/orders/${orderId}/blanks/${editingBlank}` : `/api/orders/${orderId}/blanks`;
    await fetch(url, { method: editingBlank ? 'PATCH' : 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(blankForm) });
    blankForm = { ...blankForm, title: '', comments: '' };
    editingBlank = null;
    await load();
  }
  function editBlank(blank) { editingBlank = blank.id; blankForm = { ...blankForm, ...blank }; }
  async function copyBlank(id) { await fetch(`/api/orders/${orderId}/blanks/${id}/copy`, { method: 'POST' }); await load(); }
  async function deleteBlank(id) {
    await fetch(`/api/orders/${orderId}/blanks/${id}`, { method: 'DELETE' });
    await load();
  }
  onMount(load);
</script>

{#if data}
<div class="container-fluid order-detail"><div class="row"><div class="col-sm-12"><h1 class="page-header">{data.order.title} <small>({data.order.type})</small></h1></div></div>
  <Calculation {orderId} />
  <ReportActions kind="orders" identity={orderId} />
  <div class="row"><div class="col-sm-12"><form onsubmit={(event) => { event.preventDefault(); save(); }}>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="detail_title">Название</label><input class="form-control" id="detail_title" bind:value={title} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_format">Формат</label><input class="form-control" id="detail_format" bind:value={form.format} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_printing">Тираж</label><input class="form-control" id="detail_printing" type="number" bind:value={form.printing} /></div></div></div>
    <div class="row"><div class="col-md-3"><div class="form-group"><label for="detail_status">Статус заказа</label><select class="form-control" id="detail_status" bind:value={form.status_id}>{#each data.metadata.statuses as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-3"><div class="form-group"><label for="detail_order_date">Дата заказа</label><input class="form-control" id="detail_order_date" type="date" bind:value={form.order_date} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_prod_date">Дата производства</label><input class="form-control" id="detail_prod_date" type="date" bind:value={form.prod_date} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_deadline">Дедлайн</label><input class="form-control" id="detail_deadline" type="date" bind:value={form.deadline} /></div></div></div>
    <div class="row"><div class="col-md-4"><div class="form-group"><label for="detail_manager">Менеджер</label><select class="form-control" id="detail_manager" bind:value={form.manager_id}>{#each data.metadata.managers as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-4"><div class="form-group"><label for="detail_customer">Заказчик</label><select class="form-control" id="detail_customer" bind:value={form.customer_id}><option value="">- Выберите -</option>{#each data.metadata.customers as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-4"><div class="form-group"><BillSelector bind:value={form.bill_id} bind:selectedBill /></div></div></div>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="detail_files">Файлы</label><textarea class="form-control" id="detail_files" rows="2" bind:value={form.files}></textarea></div></div><div class="col-md-6"><div class="form-group"><label for="detail_comment">Примечания</label><textarea class="form-control" id="detail_comment" rows="2" bind:value={form.comment}></textarea></div></div></div>
    <button class="btn btn-primary" type="submit" disabled={saving}>Сохранить</button> <button class="btn btn-default" type="button" onclick={onBack}>Назад</button> <button class="btn btn-danger" type="button" onclick={remove}>Удалить</button> {#if message}<span class="save-message">{message}</span>{/if}</form></div></div>
  <div class="row"><div class="col-sm-12"><ul class="nav-tabs-static"><li class="active">Общие сведения</li><li>Дизайн/препресс</li><li>Заготовки</li><li>Сборка</li><li>Прочие работы</li><li>История</li></ul></div></div>
  <OrderOperations {orderId} onMessage={(value) => message = value} />
  <div class="row"><div class="col-sm-12"><div class="panel panel-default"><div class="panel-heading">Общие сведения</div><div class="panel-body"><p>Стоимость: {data.calculation.total}</p><p class="text-muted">{data.calculation.message}</p><table class="table table-striped"><thead><tr><th>Состав заказа</th><th>Активна</th><th>Скидка/наценка</th></tr></thead><tbody>{#each data.markups as markup}<tr><td>{markup.type}</td><td><input type="checkbox" checked={markup.active} onchange={(event) => markup.active = event.currentTarget.checked} /></td><td><input class="form-control input-sm" type="number" bind:value={markup.value} /></td></tr>{/each}</tbody></table><h3>Заготовки</h3><form class="blank-form" onsubmit={(event) => { event.preventDefault(); addBlank(); }}><input class="form-control" placeholder="Название заготовки" bind:value={blankForm.title} required /><select class="form-control" bind:value={blankForm.printer_id}><option value={0}>Без печати</option>{#each blanks.metadata.printers as item}<option value={item.id}>{item.title}</option>{/each}</select><select class="form-control" bind:value={blankForm.printer_process_id}><option value="">Процесс не выбран</option>{#each blanks.metadata.printer_processes.filter((item) => !blankForm.printer_id || item.printer_id == blankForm.printer_id) as item}<option value={item.id}>{item.title}</option>{/each}</select><select class="form-control" bind:value={blankForm.paper_id}><option value="">Бумага не выбрана</option>{#each blanks.metadata.papers.filter((item) => !blankForm.paper_id || true) as item}<option value={item.id}>{item.title} ({item.weight ?? ''})</option>{/each}</select><select class="form-control" bind:value={blankForm.material_id}><option value="">Материал не выбран</option>{#each blanks.metadata.materials as item}<option value={item.id}>{item.title}</option>{/each}</select><input class="form-control" type="number" min="0" placeholder="Деталей на листе" bind:value={blankForm.details_per_sheet} /><input class="form-control" type="number" min="1" placeholder="Деталей в заготовке" bind:value={blankForm.details_per_blank} /><input class="form-control" type="number" min="0" placeholder="Пластины" bind:value={blankForm.plates} /><label class="blank-afterprint"><input type="checkbox" bind:checked={blankForm.self_print} /> «сам на себя»</label>{#each blanks.metadata.afterprints as item}<label class="blank-afterprint"><input type="checkbox" checked={blankForm.afterprints.some((entry) => entry.id === item.id && entry.active)} onchange={(event) => blankForm.afterprints = event.currentTarget.checked ? [...blankForm.afterprints.filter((entry) => entry.id !== item.id), {id: item.id, active: true, parameters: ''}] : blankForm.afterprints.filter((entry) => entry.id !== item.id)} /> {item.title}</label>{/each}<button class="btn btn-default" type="submit">{editingBlank ? 'Сохранить заготовку' : 'Новая заготовка'}</button>{#if editingBlank}<button class="btn btn-default" type="button" onclick={() => (editingBlank = null)}>Отмена</button>{/if}</form>{#if blanks.items.length}<table class="table table-striped"><thead><tr><th>Название</th><th>Печатная машина</th><th>Бумага</th><th>Цветность</th><th>Себестоимость</th><th>Действия</th></tr></thead><tbody>{#each blanks.items as blank}<tr><td>{blank.title}</td><td>{blank.printer}</td><td>{blank.paper}</td><td>{blank.colors_front} / {blank.colors_back}</td><td>{blank.cost}</td><td><button class="btn btn-xs btn-primary" type="button" onclick={() => editBlank(blank)}>Изменить</button> <button class="btn btn-xs btn-info" type="button" onclick={() => copyBlank(blank.id)}>Копировать</button> <button class="btn btn-xs btn-danger" type="button" onclick={() => deleteBlank(blank.id)}>Удалить</button></td></tr>{/each}</tbody></table>{:else}<p>Заготовки не введены.</p>{/if}{#each Object.entries(data.operations) as [key, items]}<h3>{key}</h3>{#if items.length}<ul>{#each items as item}<li>{item.title} — {item.quantity}</li>{/each}</ul>{:else}<p>Нет записей.</p>{/if}{/each}<h3>История изменений</h3>{#if history.length}<table class="table table-bordered table-striped"><thead><tr><th>Дата</th><th>Сотрудник</th><th>Действие</th></tr></thead><tbody>{#each history as item}<tr><td>{item.date}</td><td>{item.user}</td><td>{item.comment}</td></tr>{/each}</tbody></table>{:else}<p>История изменений пуста.</p>{/if}</div></div></div></div>
</div>
{:else}<div class="container-fluid"><p>Загрузка заказа...</p></div>{/if}
