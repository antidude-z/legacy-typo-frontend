<script>
  import { onMount } from 'svelte';

  export let orderId;
  export let onMessage = () => {};
  export let onChanged = () => {};

  const definitions = [
    ['prepresses', 'Дизайн/препресс', 'prepress_id'],
    ['redactions', 'Редактура', 'redaction_id'],
    ['compiles', 'Сборка', 'compile_id'],
    ['others', 'Прочие работы', 'other_work_id'],
  ];
  let data = { choices: {}, operations: {} };
  let forms = Object.fromEntries(definitions.map(([operation, , foreignKey]) => [operation, { [foreignKey]: '', quantity: 1, fitting: false }]));
  let editing = null;
  let busy = false;

  function makeForm(operation, foreignKey) {
    return { [foreignKey]: data.choices[operation]?.[0]?.id ?? '', quantity: 1, fitting: false };
  }

  function setField(operation, field, value) {
    forms = { ...forms, [operation]: { quantity: 1, fitting: false, ...forms[operation], [field]: value } };
  }

  async function load() {
    const response = await fetch(`/api/orders/${orderId}/operations`);
    if (response.ok) {
      data = await response.json();
      forms = Object.fromEntries(definitions.map(([operation, , foreignKey]) => [operation, forms[operation] ?? makeForm(operation, foreignKey)]));
    }
  }

  async function add(operation, foreignKey) {
    if (busy || !forms[operation]?.[foreignKey]) return;
    busy = true;
    try {
      const itemId = editing?.operation === operation ? editing.id : null;
      const response = await fetch(`/api/orders/${orderId}/${operation}${itemId ? `/${itemId}` : ''}`, { method: itemId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(forms[operation]) });
      if (!response.ok) throw new Error('Не удалось добавить работу');
      onMessage(itemId ? 'Работа изменена' : 'Работа добавлена');
      editing = null;
      await load();
      onChanged();
    } catch (error) { onMessage(error.message); }
    finally { busy = false; }
  }

  function edit(operation, item, foreignKey) {
    editing = { operation, id: item.id };
    forms = { ...forms, [operation]: { [foreignKey]: item.reference_id, quantity: item.quantity, fitting: item.fitting } };
  }

  async function remove(operation, id) {
    if (busy) return;
    busy = true;
    try {
      const response = await fetch(`/api/orders/${orderId}/${operation}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Не удалось удалить работу');
      await load();
      onChanged();
    } catch (error) { onMessage(error.message); }
    finally { busy = false; }
  }

  async function restore(operation, id) {
    if (busy) return;
    busy = true;
    try {
      const response = await fetch(`/api/orders/${orderId}/${operation}/${id}/restore`, { method: 'POST' });
      if (!response.ok) throw new Error('Не удалось восстановить работу');
      await load();
      onChanged();
    } catch (error) { onMessage(error.message); }
    finally { busy = false; }
  }

  async function permanentDelete(operation, id) {
    if (busy || !data.permissions?.permanent_delete) return;
    busy = true;
    try {
      const response = await fetch(`/api/orders/${orderId}/${operation}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Не удалось удалить работу окончательно');
      await load();
      onChanged();
    } catch (error) { onMessage(error.message); }
    finally { busy = false; }
  }

  onMount(load);
</script>

<div class="order-operations">
  {#each definitions as [operation, title, foreignKey]}
    <section class="panel panel-default operation-panel">
      <div class="panel-heading">{title}</div>
      <div class="panel-body">
        <form class="operation-form" onsubmit={(event) => { event.preventDefault(); add(operation, foreignKey); }}>
          <select class="form-control" bind:value={forms[operation][foreignKey]} required>
            {#if forms[operation][foreignKey] && !(data.choices[operation] ?? []).some(item => item.id == forms[operation][foreignKey])}<option value={forms[operation][foreignKey]}>Unavailable work #{forms[operation][foreignKey]}</option>{/if}
            <option value="">Выберите работу</option>
            {#each data.choices[operation] ?? [] as choice}<option value={choice.id}>{choice.title}</option>{/each}
          </select>
          <input class="form-control" type="number" min="0" value={forms[operation]?.quantity ?? 1} onchange={(event) => setField(operation, 'quantity', event.currentTarget.value)} required aria-label="Количество" />
          {#if operation === 'compiles'}<label><input type="checkbox" checked={forms[operation]?.fitting ?? false} onchange={(event) => setField(operation, 'fitting', event.currentTarget.checked)} /> Приладка</label>{/if}
          <button class="btn btn-primary btn-sm" type="submit" disabled={busy}>{editing?.operation === operation ? 'Сохранить' : 'Добавить'}</button>
          {#if editing?.operation === operation}<button class="btn btn-default btn-sm" type="button" onclick={() => editing = null}>Отмена</button>{/if}
        </form>
        <table class="table table-striped table-bordered"><thead><tr><th>Работа</th><th>Количество</th>{#if operation === 'compiles'}<th>Приладка</th>{/if}<th>Действия</th></tr></thead><tbody>
          {#each data.operations[operation] ?? [] as item}<tr class:warning={item.deleted}><td>{(data.choices[operation] ?? []).find((choice) => choice.id == item.reference_id)?.title ?? `#${item.reference_id}`}</td><td>{item.quantity}</td>{#if operation === 'compiles'}<td>{item.fitting ? 'Да' : 'Нет'}</td>{/if}<td>{#if item.deleted}<span class="text-muted">Удалена</span> <button class="btn btn-default btn-xs" type="button" disabled={busy || !data.permissions?.restore} onclick={() => restore(operation, item.id)}>Восстановить</button> <button class="btn btn-danger btn-xs" type="button" disabled={busy || !data.permissions?.permanent_delete} onclick={() => permanentDelete(operation, item.id)}>Удалить окончательно</button>{:else}<button class="btn btn-default btn-xs" type="button" disabled={busy} onclick={() => edit(operation, item, foreignKey)}>Изменить</button> <button class="btn btn-danger btn-xs" type="button" disabled={busy} onclick={() => remove(operation, item.id)}>Удалить</button>{/if}</td></tr>{:else}<tr><td colspan={operation === 'compiles' ? 4 : 3}>Работы не добавлены</td></tr>{/each}
        </tbody></table>
      </div>
    </section>
  {/each}
</div>