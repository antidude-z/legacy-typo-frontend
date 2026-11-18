<script>
  import { onMount } from 'svelte';
  import { priceError } from './pricing.js';
  export let orderId;
  let result = null;
  let error = '';
  let busy = false;
  async function calculate() {
    if (busy) return;
    busy = true;
    error = '';
    try {
    const response = await fetch(`/api/orders/${orderId}/recalculate`, { method: 'POST' });
    if (!response.ok) { error = priceError(response.status); return; }
    result = await response.json(); error = '';
    } catch { error = priceError(0); }
    finally { busy = false; }
  }
  const names = { design: 'Дизайн/препресс', redaction: 'Редактура', paper: 'Бумага', imagesetter: 'Фотовывод', print: 'Печать', afterprint: 'Постпечать', compile: 'Сборка', other_works: 'Прочие работы', manager: 'Менеджер' };
  export let storedCalculation = null;
  onMount(() => {
    const refresh = () => calculate();
    window.addEventListener('order-calculation-changed', refresh);
    return () => window.removeEventListener('order-calculation-changed', refresh);
  });
</script>

<button type="button" class="btn btn-info" disabled={busy} onclick={calculate}>{busy ? 'Пересчёт…' : 'Пересчитать'}</button>
{#if storedCalculation}<span class="calculation-status text-muted">{storedCalculation.message}</span>{/if}
{#if error}<div class="alert alert-danger">{error}</div>{/if}
{#if result}
  {#if result.missing.length}<div class="alert alert-danger">Не найдены цены: {result.missing.join(', ')}</div>{/if}
  <table class="table table-bordered"><thead><tr><th>Состав заказа</th><th>Базовая стоимость</th><th>Скидка/наценка</th><th>Итоговая стоимость</th></tr></thead><tbody>
    {#each Object.entries(result.markups) as [key, row]}<tr><td>{names[key] ?? key}</td><td>{row.base}</td><td>{key === 'manager' ? result.manager_markup : row.markup}</td><td>{row.total}</td></tr>{/each}
  </tbody><tfoot><tr><th>Расчетная стоимость</th><td>{result.base}</td><td>Цена изделия: {result.item}</td><td>{result.result}</td></tr><tr><th>Стоимость продажи</th><td colspan="3">{result.stored_total}</td></tr></tfoot></table>
  {#each Object.entries(result.work_details) as [kind, rows]}
    {#if rows.length}
      <h4>{names[kind] ?? kind}</h4>
      <table class="table table-bordered table-striped"><thead><tr><th>Название</th><th>Кол-во</th><th>Цена</th><th>Стоимость</th></tr></thead><tbody>
        {#each rows as row}<tr><td>{row.title}</td><td>{row.quantity}</td><td>{row.price}</td><td>{row.cost}</td></tr>{/each}
      </tbody></table>
      {#if kind === 'compile'}
        {#each rows as row}
          {#each row.stages ?? [] as stage}
            <details><summary>{stage.title}: {stage.payment_count}</summary>
              <p>Отбраковка: {stage.waste}; совместно: {stage.together}; работ: {stage.work_count}</p>
              {#each Object.values(stage.materials) as material}<p>{material.title}: {material.quantity} × {material.price} = {material.cost}</p>{/each}
            </details>
          {/each}
        {/each}
      {/if}
    {/if}
  {/each}
  {#each Object.entries(result.blanks) as [id, blank]}
    <details><summary>{blank.details.title} — {blank.cost}</summary>
      <p>Тираж: {blank.details.printing}</p>
      <p>Бумага: {blank.details.paper.cost ?? '0'}; фотовывод: {blank.details.imagesetter.cost ?? '0'}</p>
      {#each blank.details.print.stages ?? [] as stage}
        <p>{stage.title}: {stage.payment_count} × {stage.price} = {stage.cost}</p>
      {/each}
      {#each blank.details.afterprint as work}
        {#each work.steps as step}
          <h5>{step.details.title}</h5>
          {#each step.details.stages as stage}
            <p>{stage.title}: {stage.payment_count} × {stage.price} = {stage.cost}</p>
            {#each stage.materials as material}<p>{material.title}: {material.quantity} × {material.price} = {material.cost}</p>{/each}
          {/each}
        {/each}
      {/each}
    </details>
  {/each}
{/if}