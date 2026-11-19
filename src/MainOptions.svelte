<script>
  import { onMount } from 'svelte';
  let items = [];
  let error = '';
  let loading = true;
  onMount(async () => {
    try {
      const response = await fetch('/api/options/main');
      if (!response.ok) {
        error = response.status === 403 ? 'Недостаточно прав для просмотра настроек.' : response.status === 401 ? 'Войдите в систему.' : 'Не удалось загрузить настройки.';
        return;
      }
      items = (await response.json()).items;
    } catch { error = 'Ошибка сети. Обновите страницу.'; }
    finally { loading = false; }
  });
</script>

<main class="container-fluid">
  <h1 class="page-header">Основные настройки</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>
  {:else if loading}<p>Загрузка…</p>
  {:else}<div class="table-responsive"><table class="table table-bordered table-striped">
    <thead><tr><th>Раздел</th><th>Название</th><th>Параметр</th><th>Значение</th><th>Действует с</th></tr></thead>
    <tbody>{#each items as item}<tr><td>{item.depart}</td><td>{item.title}</td><td>{item.alias}</td><td>{item.value}</td><td>{item.actual_since ?? ''}</td></tr>{:else}<tr><td colspan="5">Нет настроек</td></tr>{/each}</tbody>
  </table></div>{/if}
</main>