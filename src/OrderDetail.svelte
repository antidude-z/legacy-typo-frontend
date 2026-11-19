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
  let paperTypeId = '';
  let paperFormatId = '';
  let editingBlank = null;
  let selectedBill = null;
  let saving = false;
  let activeTab = 'total';
  const destination = safeDestination(new URLSearchParams(window.location.search).get('destination'), '/orders', window.location.origin);
  $: availablePaperFormats = blanks.metadata.paper_formats?.filter((item) => !paperTypeId || blanks.metadata.papers.some((paper) => paper.type_id == paperTypeId && paper.format_id == item.id)) ?? [];
  $: availablePaperWeights = blanks.metadata.papers?.filter((item) => (!paperTypeId || item.type_id == paperTypeId) && (!paperFormatId || item.format_id == paperFormatId)) ?? [];
  $: availableProcesses = blanks.metadata.printer_processes?.filter((item) => !blankForm.printer_id || item.printer_id == blankForm.printer_id) ?? [];
  $: availableFields = blanks.metadata.printer_fields?.filter((item) => item.printer_id == blankForm.printer_id && (!paperFormatId || item.format_id == paperFormatId)) ?? [];
  $: selectedPrinter = blanks.metadata.printers?.find((item) => item.id == blankForm.printer_id);

  function updatePaperType(value) {
    paperTypeId = value;
    if (!availablePaperFormats.some((item) => item.id == paperFormatId)) paperFormatId = '';
    blankForm = { ...blankForm, paper_id: '' };
  }

  function updatePaperFormat(value) {
    paperFormatId = value;
    blankForm = { ...blankForm, paper_id: '' };
  }

  function selectPaper(value) {
    blankForm = { ...blankForm, paper_id: value };
  }

  function setAfterprint(afterprint, active, parameterId = null, value = '') {
    const current = blankForm.afterprints.find((entry) => entry.id == afterprint.id) ?? { id: afterprint.id, active: false, parameters: {} };
    const parameters = typeof current.parameters === 'object' ? current.parameters : {};
    if (parameterId !== null) parameters[parameterId] = value;
    const next = { id: afterprint.id, active, parameters };
    blankForm = { ...blankForm, afterprints: [...blankForm.afterprints.filter((entry) => entry.id != afterprint.id), next] };
  }

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
      form = { ...form, width: Number(form.width) || 0, height: Number(form.height) || 0 };
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
    window.dispatchEvent(new CustomEvent('order-calculation-changed'));
  }
  function editBlank(blank) {
    editingBlank = blank.id;
    const paper = blanks.metadata.papers.find((item) => item.id == blank.paper_id);
    paperTypeId = paper?.type_id ?? '';
    paperFormatId = paper?.format_id ?? '';
    blankForm = { ...blankForm, ...blank, afterprints: (blank.afterprints ?? []).map((entry) => ({ ...entry, parameters: entry.parameters && typeof entry.parameters === 'object' ? entry.parameters : {} })) };
  }
  async function copyBlank(id) { await fetch(`/api/orders/${orderId}/blanks/${id}/copy`, { method: 'POST' }); await load(); }
  async function deleteBlank(id) {
    const response = await fetch(`/api/orders/${orderId}/blanks/${id}`, { method: 'DELETE' });
    if (!response.ok) { message = 'Не удалось удалить заготовку'; return; }
    await load();
    window.dispatchEvent(new CustomEvent('order-calculation-changed'));
  }
  function operationChanged() {
    window.dispatchEvent(new CustomEvent('order-calculation-changed'));
  }
  function showTab(tab) {
    activeTab = tab;
  }
  onMount(load);
</script>

{#if data}
<div class="container-fluid order-detail"><div class="row"><div class="col-sm-12"><h1 class="page-header">{data.order.title} <small>({data.order.type})</small></h1></div></div>
  <Calculation {orderId} storedCalculation={data.calculation} />
  <ReportActions kind="orders" identity={orderId} />
  <div class="row"><div class="col-sm-12"><form onsubmit={(event) => { event.preventDefault(); save(); }}>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="detail_title">Название</label><input class="form-control" id="detail_title" bind:value={title} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_format">Формат</label><input class="form-control" id="detail_format" bind:value={form.format} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_printing">Тираж</label><input class="form-control" id="detail_printing" type="number" bind:value={form.printing} /></div></div></div>
    <div class="row"><div class="col-md-3"><div class="form-group"><label for="detail_status">Статус заказа</label><select class="form-control" id="detail_status" bind:value={form.status_id}>{#each data.metadata.statuses as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-3"><div class="form-group"><label for="detail_order_date">Дата заказа</label><input class="form-control" id="detail_order_date" type="date" bind:value={form.order_date} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_prod_date">Дата производства</label><input class="form-control" id="detail_prod_date" type="date" bind:value={form.prod_date} /></div></div><div class="col-md-3"><div class="form-group"><label for="detail_deadline">Дедлайн</label><input class="form-control" id="detail_deadline" type="date" bind:value={form.deadline} /></div></div></div>
    <div class="row"><div class="col-md-4"><div class="form-group"><label for="detail_manager">Менеджер</label><select class="form-control" id="detail_manager" bind:value={form.manager_id}>{#each data.metadata.managers as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-4"><div class="form-group"><label for="detail_customer">Заказчик</label><select class="form-control" id="detail_customer" bind:value={form.customer_id}><option value="">- Выберите -</option>{#each data.metadata.customers as item}<option value={item.id}>{item.title}</option>{/each}</select></div></div><div class="col-md-4"><div class="form-group"><BillSelector bind:value={form.bill_id} bind:selectedBill /></div></div></div>
    <div class="row"><div class="col-md-6"><div class="form-group"><label for="detail_files">Файлы</label><textarea class="form-control" id="detail_files" rows="2" bind:value={form.files}></textarea></div></div><div class="col-md-6"><div class="form-group"><label for="detail_comment">Примечания</label><textarea class="form-control" id="detail_comment" rows="2" bind:value={form.comment}></textarea></div></div></div>
    <button class="btn btn-primary" type="submit" disabled={saving}>Сохранить</button> <button class="btn btn-default" type="button" onclick={onBack}>Назад</button> <button class="btn btn-danger" type="button" onclick={remove}>Удалить</button> {#if message}<span class="save-message">{message}</span>{/if}</form></div></div>
  <div class="row"><div class="col-sm-12"><ul class="nav-tabs-static">{#each [['total', 'Общие сведения'], ['operations', 'Дизайн/препресс'], ['blanks', 'Заготовки'], ['compile', 'Сборка'], ['other', 'Прочие работы'], ['history', 'История']] as tab}<li class:active={activeTab === tab[0]}><button type="button" onclick={() => showTab(tab[0])}>{tab[1]}</button></li>{/each}</ul></div></div>
  {#if activeTab === 'operations' || activeTab === 'compile' || activeTab === 'other'}<OrderOperations {orderId} onMessage={(value) => message = value} onChanged={operationChanged} />{/if}
  <div class="row"><div class="col-sm-12"><div class="panel panel-default"><div class="panel-heading">Общие сведения</div><div class="panel-body">{#if activeTab === 'total'}<p>Стоимость: {data.calculation.total}</p><p class="text-muted">{data.calculation.message}</p><table class="table table-striped"><thead><tr><th>Состав заказа</th><th>Активна</th><th>Скидка/наценка</th></tr></thead><tbody>{#each data.markups as markup}<tr><td>{markup.type}</td><td><input type="checkbox" checked={markup.active} onchange={(event) => markup.active = event.currentTarget.checked} /></td><td><input class="form-control input-sm" type="number" bind:value={markup.value} /></td></tr>{/each}</tbody></table>{/if}{#if activeTab === 'blanks'}<h3>Заготовки</h3><form class="blank-form" onsubmit={(event) => { event.preventDefault(); addBlank(); }}><input class="form-control" placeholder="Название заготовки" bind:value={blankForm.title} required /><select class="form-control" bind:value={blankForm.printer_id} onchange={() => { blankForm = { ...blankForm, printer_process_id: '', cutting: 1 }; }}><option value={0}>Без печати</option>{#each blanks.metadata.printers as item}<option value={item.id}>{item.title}</option>{/each}</select>{#if selectedPrinter?.need_imagesetter}<label class="blank-afterprint"><input type="checkbox" bind:checked={blankForm.self_print} /> «сам на себя»</label><label>Пластины<input class="form-control" type="number" min="0" bind:value={blankForm.plates} /></label>{/if}<select class="form-control" bind:value={blankForm.printer_process_id}><option value="">Процесс не выбран</option>{#each availableProcesses as item}<option value={item.id}>{item.title}</option>{/each}</select><select class="form-control" value={paperTypeId} onchange={(event) => updatePaperType(event.currentTarget.value)}><option value="">Вид бумаги</option>{#each blanks.metadata.paper_types as item}<option value={item.id}>{item.title}</option>{/each}</select><select class="form-control" value={paperFormatId} onchange={(event) => updatePaperFormat(event.currentTarget.value)}><option value="">Формат бумаги</option>{#each availablePaperFormats as item}<option value={item.id}>{item.title}</option>{/each}</select><select class="form-control" value={blankForm.paper_id} onchange={(event) => selectPaper(event.currentTarget.value)}><option value="">Плотность бумаги</option>{#each availablePaperWeights as item}<option value={item.id}>{item.weight} г/м² — {item.title}</option>{/each}</select><select class="form-control" bind:value={blankForm.cutting}><option value="">Раскрой</option>{#each availableFields as item}<option value={item.pieces}>{item.pieces} ({item.paper_width}×{item.paper_height})</option>{/each}</select><select class="form-control" bind:value={blankForm.material_id}><option value="">Материал не выбран</option>{#each blanks.metadata.materials as item}<option value={item.id}>{item.title}</option>{/each}</select><input class="form-control" type="number" min="0" placeholder="Деталей на листе" bind:value={blankForm.details_per_sheet} /><input class="form-control" type="number" min="1" placeholder="Деталей в заготовке" bind:value={blankForm.details_per_blank} /><input class="form-control" type="number" min="0" placeholder="Разных деталей" bind:value={blankForm.different_details} />{#each blanks.metadata.afterprints as item}<div class="blank-afterprint"><label title={item.tooltip}><input type="checkbox" checked={blankForm.afterprints.some((entry) => entry.id == item.id && entry.active)} onchange={(event) => setAfterprint(item, event.currentTarget.checked)} /> {item.title}</label>{#each item.parameters as parameter}<label class="blank-parameter">{parameter.title}{#if parameter.type === 'select'}<select class="form-control" value={blankForm.afterprints.find((entry) => entry.id == item.id)?.parameters?.[parameter.id] ?? parameter.value} onchange={(event) => setAfterprint(item, true, parameter.id, event.currentTarget.value)}>{#each parameter.values as value}<option value={value.id}>{value.value}</option>{/each}</select>{:else}<input class="form-control" value={blankForm.afterprints.find((entry) => entry.id == item.id)?.parameters?.[parameter.id] ?? parameter.value} onchange={(event) => setAfterprint(item, true, parameter.id, event.currentTarget.value)} />{/if}</label>{/each}</div>{/each}<button class="btn btn-default" type="submit">{editingBlank ? 'Сохранить заготовку' : 'Новая заготовка'}</button>{#if editingBlank}<button class="btn btn-default" type="button" onclick={() => (editingBlank = null)}>Отмена</button>{/if}</form>{#if blanks.items.length}<table class="table table-striped"><thead><tr><th>Название</th><th>Печатная машина</th><th>Бумага</th><th>Цветность</th><th>Себестоимость</th><th>Действия</th></tr></thead><tbody>{#each blanks.items as blank}<tr><td>{blank.title}</td><td>{blank.printer}</td><td>{blank.paper}</td><td>{blank.colors_front} / {blank.colors_back}</td><td>{blank.cost}</td><td><button class="btn btn-xs btn-primary" type="button" onclick={() => editBlank(blank)}>Изменить</button> <button class="btn btn-xs btn-info" type="button" onclick={() => copyBlank(blank.id)}>Копировать</button> <button class="btn btn-xs btn-danger" type="button" onclick={() => deleteBlank(blank.id)}>Удалить</button></td></tr>{/each}</tbody></table>{:else}<p>Заготовки не введены.</p>{/if}{/if}{#if activeTab === 'history'}<h3>История изменений</h3>{#if history.length}<table class="table table-bordered table-striped"><thead><tr><th>Дата</th><th>Сотрудник</th><th>Действие</th></tr></thead><tbody>{#each history as item}<tr><td>{item.date}</td><td>{item.user}</td><td>{item.comment}</td></tr>{/each}</tbody></table>{:else}<p>История изменений пуста.</p>{/if}{/if}</div></div></div></div>
</div>
{:else}<div class="container-fluid"><p>Загрузка заказа...</p></div>{/if}
