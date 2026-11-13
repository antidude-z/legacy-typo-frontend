<script>
  import { onMount } from 'svelte';
  export let kind;
  export let identity;
  let items = [];
  let error = '';
  let paymentReport = null;
  let shippingReport = null;
  let institute = '';
  let customer = '';
  let accountants = [];
  let buh = '';
  onMount(async () => {
    try {
      const response = await fetch(`/api/reports/for/${kind}/${identity}`);
      if (!response.ok) throw new Error('Не удалось загрузить документы.');
      items = (await response.json()).items;
    } catch (failure) { error = failure.message; }
  });
</script>
{#if error}<p role="status">{error}</p>{/if}
<div class="report-actions">
  {#each items as report}
    {#if report.available && !report.blocked}
      {#if report.id === 'order_payment'}
        <button class="btn btn-default" type="button" onclick={() => paymentReport = report}>{report.title}</button>
      {:else if report.id === 'order_shipping'}
        <button class="btn btn-default" type="button" onclick={async () => { shippingReport = report; const response = await fetch(`/api/reports/form/${report.id}/${identity}`); const form = await response.json(); accountants = form.fields?.[0]?.options ?? []; buh = form.fields?.[0]?.default ?? ''; }}>{report.title}</button>
      {:else}<a class="btn btn-default" href={report.url} target="_blank" rel="noopener" download={report.download}>{report.title}</a>{/if}
    {:else}<span class="text-muted">{report.title}: {report.blocked ? 'недоступен при текущем статусе' : 'формат ещё не перенесён'}</span>{/if}
  {/each}
</div>
{#if paymentReport}
  <form class="report-form" method="post" action={paymentReport.url} target="_blank" onsubmit={() => paymentReport = null}>
    <label for="payment_institute">Институт, подразделение, кафедра</label>
    <input id="payment_institute" class="form-control" name="vars[institute]" bind:value={institute} />
    <label for="payment_customer">ФИО заказчика</label>
    <input id="payment_customer" class="form-control" name="vars[customer]" bind:value={customer} />
    <button class="btn btn-primary" type="submit">Сформировать</button>
    <button class="btn btn-default" type="button" onclick={() => paymentReport = null}>Отмена</button>
  </form>
{/if}
{#if shippingReport}
  <form class="report-form" method="post" action={shippingReport.url} target="_blank" onsubmit={() => shippingReport = null}>
    <label for="shipping_buh">Бухгалтер</label>
    <select id="shipping_buh" class="form-control" name="vars[buh]" bind:value={buh} required>
      {#each accountants as accountant}<option value={accountant}>{accountant}</option>{/each}
    </select>
    <button class="btn btn-primary" type="submit">Сформировать</button>
    <button class="btn btn-default" type="button" onclick={() => shippingReport = null}>Отмена</button>
  </form>
{/if}