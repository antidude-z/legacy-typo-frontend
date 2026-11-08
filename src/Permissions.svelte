<script>
  import { onMount } from 'svelte';
  let data = { roles: [], modules: [] };
  let selected = {};
  let error = '';
  let saved = false;
  let busy = false;

  function rebuild() {
    selected = {};
    for (const module of data.modules) {
      for (const permission of module.permissions) {
        selected[permission.id] = new Set(Object.entries(permission.roles).filter(([, value]) => value).map(([role]) => role));
      }
    }
  }

  function checked(permissionId, roleId) {
    return selected[permissionId]?.has(String(roleId)) ?? false;
  }

  function toggle(permissionId, roleId) {
    const values = new Set(selected[permissionId] ?? []);
    const key = String(roleId);
    if (values.has(key)) values.delete(key); else values.add(key);
    selected = { ...selected, [permissionId]: values };
    saved = false;
  }

  async function load() {
    const response = await fetch('/api/options/permissions');
    if (!response.ok) throw new Error(response.status === 401 ? 'Требуется авторизация.' : response.status === 403 ? 'Недостаточно прав для управления разрешениями.' : 'Не удалось загрузить разрешения.');
    data = await response.json();
    rebuild();
  }

  async function save() {
    busy = true; error = ''; saved = false;
    try {
      const permissions = Object.fromEntries(Object.entries(selected).map(([id, roles]) => [id, [...roles].map(Number)]));
      const response = await fetch('/api/options/permissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissions }) });
      if (!response.ok) throw new Error(response.status === 422 ? 'Матрица разрешений содержит неверные данные.' : response.status === 403 ? 'Недостаточно прав для управления разрешениями.' : response.status === 401 ? 'Требуется авторизация.' : 'Не удалось сохранить разрешения.');
      saved = true;
    } catch (failure) { error = failure.message; }
    finally { busy = false; }
  }

  onMount(() => load().catch((failure) => { error = failure.message; }));
</script>

<main class="container-fluid">
  <h1 class="page-header">Разрешения ролей</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if saved}<div class="alert alert-success" role="status">Разрешения сохранены.</div>{/if}
  <form onsubmit={(event) => { event.preventDefault(); save(); }}>
    <div class="table-responsive">
      <table class="table table-bordered table-striped permissions-table">
        <thead><tr><th>Разрешение</th>{#each data.roles as role}<th class="text-center">{role.title}</th>{/each}</tr></thead>
        <tbody>
          {#each data.modules as module}
            <tr class="active"><th colspan={data.roles.length + 1}>{module.title}</th></tr>
            {#each module.permissions as permission}
              <tr><td>{permission.title}</td>{#each data.roles as role}<td class="text-center"><input type="checkbox" checked={checked(permission.id, role.id)} onchange={() => toggle(permission.id, role.id)} aria-label={`${permission.title}: ${role.title}`} /></td>{/each}</tr>
            {/each}
          {/each}
        </tbody>
      </table>
    </div>
    <button class="btn btn-primary" type="submit" disabled={busy}>Сохранить</button>
  </form>
</main>