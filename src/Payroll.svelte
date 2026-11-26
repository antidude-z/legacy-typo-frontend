<script>
  import { onMount } from 'svelte';
  import { canEditPayroll } from './payrollCapabilities.js';
  export let identity = null;
  export let action = 'create';
  let data = {managers: []};
  let form = {manager_id: '', month: String(new Date().getMonth() + 1).padStart(2, '0'), year: new Date().getFullYear()};
  let error = '';
  let busy = false;
  const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  async function request(url, options) {
    const response = await fetch(url, options); const result = await response.json();
    if (!response.ok) throw new Error(typeof result.detail === 'string' ? result.detail : 'Не удалось загрузить расчет зарплаты.');
    return result;
  }
  async function create() {
    if (busy || !canEditPayroll(data)) return; busy = true; error = '';
    try { const result = await request('/api/reports/payrolls',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); window.location.href = `/reports/payrolls/${result.id}`; }
    catch (failure) { error = failure.message; } finally { busy = false; }
  }
  async function save() {
    if (busy || !data.item || !canEditPayroll(data)) return; busy = true; error = '';
    try { await request(`/api/reports/payrolls/${identity}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({salary:data.item.salary,status:data.item.status,markups:Object.fromEntries(data.item.orders.map(row => [row.id,row.percent]))})}); data = await request(`/api/reports/payrolls/${identity}`); }
    catch (failure) { error = failure.message; } finally { busy = false; }
  }
  onMount(async () => {
    try { if (action === 'create') data = {...data,...await request('/api/reports/payrolls/form')}; else data = await request(`/api/reports/payrolls/${identity}`); }
    catch (failure) { error = failure.message; }
  });
</script>

<div class="container-fluid payroll-page">
  <h1 class="page-header">{action === 'create' ? 'Расчет зарплаты' : `Ведомость вознаграждений за ${months[Number(data.item?.period?.slice(5,7) || 1)-1]} ${data.item?.period?.slice(0,4) || ''} г.`}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if action === 'create'}
    <form onsubmit={(event) => {event.preventDefault(); create();}}>
      <label for="payroll_manager">Менеджер</label><select id="payroll_manager" class="form-control" required bind:value={form.manager_id}><option value="">- Выберите -</option>{#each data.managers as manager}<option value={manager.id}>{manager.title}</option>{/each}</select>
      <label for="payroll_month">Месяц</label><select id="payroll_month" class="form-control" bind:value={form.month}>{#each months as month,index}<option value={String(index+1).padStart(2,'0')}>{month}</option>{/each}</select>
      <label for="payroll_year">Год</label><input id="payroll_year" class="form-control" type="number" min="2000" max="2100" bind:value={form.year} />
      <button class="btn btn-primary" disabled={busy || !canEditPayroll(data)} type="submit">Перейти</button>
    </form>
  {:else if data.item}
    <label for="payroll_status">Статус</label><select id="payroll_status" class="form-control" disabled={!canEditPayroll(data)} bind:value={data.item.status}><option value="calc">Расчет</option><option value="paid">Выплачено</option></select>
    <label for="payroll_salary">Оклад</label><input id="payroll_salary" class="form-control" type="number" step="0.01" disabled={!canEditPayroll(data)} bind:value={data.item.salary} />
    <table class="table table-striped table-bordered"><thead><tr><th>Фирма</th><th>Продукция</th><th>Тираж</th><th>Счет</th><th>Дата счета</th><th>Сумма</th><th>Материалы</th><th>Работы</th><th>Подрядчик</th><th>% менеджера</th><th>Итого</th></tr></thead><tbody>
      {#each data.item.orders as row}<tr><td>{row.customer}</td><td>{row.title}</td><td>{row.printing}</td><td>{row.bill_number}</td><td>{row.bill_date}</td><td>{row.total}</td><td>{row.materials}</td><td>{row.works}</td><td>{row.contractors}</td><td><select class="form-control" disabled={!canEditPayroll(data)} bind:value={row.percent}>{#each data.markups as percent}<option value={percent}>{percent}%</option>{/each}</select></td><td>{row.salary}</td></tr>{:else}<tr><td colspan="11">Нет заказов</td></tr>{/each}
    </tbody><tfoot><tr><th colspan="5">Итого</th><th>{data.item.total}</th><th></th><th></th><th></th><th></th><th>{data.item.orders_salary}</th></tr><tr><th colspan="10">Всего за месяц</th><th>{data.item.month_salary}</th></tr></tfoot></table>
    <button class="btn btn-primary" disabled={busy || !canEditPayroll(data)} onclick={save}>Сохранить</button>
    <a class="btn btn-default" href={`/reports/payrolls/${identity}/export`} target="_blank" rel="noopener" download>Экспорт XLS</a>
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>