<script>
  export let orderId;
  let result = null;
  let error = '';
  async function calculate() {
    const response = await fetch(`/api/orders/${orderId}/recalculate`, { method: 'POST' });
    if (!response.ok) { error = 'Не удалось пересчитать заказ'; return; }
    result = await response.json(); error = '';
  }
  const names = { design: 'Дизайн/препресс', redaction: 'Редактура', paper: 'Бумага', imagesetter: 'Фотовывод', print: 'Печать', afterprint: 'Постпечать', compile: 'Сборка', other_works: 'Прочие работы', manager: 'Менеджер' };
</script>

<button type="button" class="btn btn-info" onclick={calculate}>Пересчитать</button>
{#if error}<div class="alert alert-danger">{error}</div>{/if}
{#if result}
  {#if result.missing.length}<div class="alert alert-danger">Не найдены цены: {result.missing.join(', ')}</div>{/if}
  <table class="table table-bordered"><thead><tr><th>Состав заказа</th><th>Базовая стоимость</th><th>Скидка/наценка</th><th>Итоговая стоимость</th></tr></thead><tbody>
    {#each Object.entries(result.markups) as [key, row]}<tr><td>{names[key] ?? key}</td><td>{row.base}</td><td>{key === 'manager' ? result.manager_markup : row.markup}</td><td>{row.total}</td></tr>{/each}
  </tbody><tfoot><tr><th>Итого</th><td>{result.base}</td><td>Цена изделия: {result.item}</td><td>{result.result}</td></tr></tfoot></table>
  {#each Object.entries(result.work_details) as [kind, rows]}
    {#if rows.length}
      <h4>{names[kind] ?? kind}</h4>
      <table class="table table-bordered table-striped"><thead><tr><th>Название</th><th>Кол-во</th><th>Цена</th><th>Стоимость</th></tr></thead><tbody>
        {#each rows as row}<tr><td>{row.title}</td><td>{row.quantity}</td><td>{row.price}</td><td>{row.cost}</td></tr>{/each}
      </tbody></table>
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