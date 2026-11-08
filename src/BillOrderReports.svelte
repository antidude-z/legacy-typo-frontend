<script>
  import { onMount } from 'svelte';
  export let billId;
  let orders = [];
  let error = '';

  onMount(async () => {
    try {
      const response = await fetch(`/api/reports/bills/${billId}/orders`);
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === 'string' ? payload.detail : 'Не удалось загрузить документы по заказам.');
      orders = payload.items;
    } catch (failure) {
      error = failure.message;
    }
  });
</script>

<section class="bill-order-reports">
  <h2>Документы по заказам</h2>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if !error && !orders.length}<p>Заказы не привязаны.</p>{/if}
  {#each orders as order}
    <div class="bill-order-report-row">
      <strong>Заказ №{order.id}: {order.title}</strong>
      <div class="report-actions">
        {#each order.reports as report}
          {#if report.available && !report.blocked}
            <a class="btn btn-default" href={report.url} target="_blank" rel="noopener" download={report.download}>{report.title}</a>
          {:else}
            <span class="text-muted">{report.title}: {report.blocked ? 'недоступен при текущем статусе' : 'формат ещё не перенесён'}</span>
          {/if}
        {/each}
      </div>
    </div>
  {/each}
</section>