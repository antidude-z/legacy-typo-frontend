<script>
  import { onDestroy } from 'svelte';
  import { billLabel } from './navigation.js';
  export let value = 0;
  export let selectedBill = null;
  let text = '';
  let results = [];
  let error = '';
  let busy = false;
  let timer;
  let controller;
  let sequence = 0;
  $: selectedLabel = billLabel(selectedBill);

  function search() {
    clearTimeout(timer);
    controller?.abort();
    const current = ++sequence;
    results = []; error = ''; busy = false;
    if (text.trim().length < 1) return;
    const term = text;
    timer = setTimeout(async () => {
      controller = new AbortController(); busy = true;
      try {
        const response = await fetch(`/api/accounting/bills/search?search=${encodeURIComponent(term)}`, {signal:controller.signal});
        if (!response.ok) throw new Error(response.status === 403 ? 'Недостаточно прав для поиска счетов.' : 'Не удалось найти счета.');
        const items = await response.json();
        if (current === sequence) results = items;
      } catch (failure) {
        if (failure.name !== 'AbortError' && current === sequence) error = failure.message;
      } finally { if (current === sequence) busy = false; }
    }, 250);
  }
  function choose(item) {
    clearTimeout(timer); controller?.abort(); sequence += 1;
    value = item.id;
    selectedBill = item.id ? {number:item.text} : null;
    text = ''; results = []; error = ''; busy = false;
  }
  onDestroy(() => { clearTimeout(timer); controller?.abort(); sequence += 1; });
</script>

<div class="bill-selector">
  <label for="order_bill_search">Счёт</label>
  <p>{selectedLabel}</p>
  <input id="order_bill_search" class="form-control" type="search" autocomplete="off" placeholder="Начните вводить менеджера, плательщика или номер счёта" bind:value={text} oninput={search} aria-describedby="order_bill_status" />
  <input type="hidden" name="order_bill" value={value || 0} />
  <button class="btn btn-default btn-sm" type="button" disabled={!value} onclick={() => choose({id:0})}>Не выбран</button>
  <span id="order_bill_status" role="status">{busy ? 'Поиск…' : error}</span>
  {#if results.length}<ul class="bill-search-results">{#each results as item}<li><button class="link-button" type="button" onclick={() => choose(item)}>{item.text}</button></li>{/each}</ul>{/if}
</div>