<script>
  import { onMount } from 'svelte';
  export let kind;
  export let identity;
  let items = [];
  let error = '';
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
    {#if report.available && !report.blocked}<a class="btn btn-default" href={report.url} target="_blank" rel="noopener" download={report.download}>{report.title}</a>
    {:else}<span class="text-muted">{report.title}: {report.blocked ? 'недоступен при текущем статусе' : 'формат ещё не перенесён'}</span>{/if}
  {/each}
</div>