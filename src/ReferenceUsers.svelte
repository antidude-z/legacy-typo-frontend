<script>
  import { onMount } from 'svelte';
  import { inventoryError } from './inventory.js';
  export let identity = null;
  export let action = 'list';
  let data = {items:[],roles:[],page:1,last_page:1};
  let form = null;
  let errors = {};
  let error = '';
  let busy = false;
  let sort = 'id';
  let order = 'desc';
  const base = '/references/users';
  const api = '/api/employee-references';
  const fields = [['surname','Фамилия'],['name','Имя'],['post','Должность'],['phone','Телефон'],['email','E-mail']];
  async function request(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 422 && typeof result.detail === 'object') errors = result.detail;
      throw new Error(inventoryError(response.status));
    }
    return result;
  }
  async function load(page = 1) {
    try { data = await request(`${api}?page=${page}&sort=${sort}&order=${order}`); error = ''; }
    catch (failure) { error = failure.message; }
  }
  async function sortBy(key) { order = sort === key && order === 'asc' ? 'desc' : 'asc'; sort = key; await load(data.page); }
  async function save() {
    if (busy) return;
    busy = true; error = ''; errors = {};
    try {
      await request(action === 'create' ? api : `${api}/${identity}`, {method:action === 'create' ? 'POST' : 'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      window.location.href = base;
    } catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  async function remove() {
    if (busy) return;
    busy = true;
    try { await request(`${api}/${identity}`, {method:'DELETE'}); window.location.href = base; }
    catch (failure) { error = failure.message; }
    finally { busy = false; }
  }
  onMount(async () => {
    try {
      if (action === 'list') { await load(); return; }
      if (action === 'show') { window.location.replace(`${base}/${identity}/edit`); return; }
      if (action === 'restore') { await request(`${api}/${identity}/restore`, {method:'POST'}); window.location.replace(base); return; }
      if (action === 'create') {
        data = {...data,...await request(`${api}/form`)};
        form = {surname:'',name:'',post:'',phone:'',email:'',role_id:data.roles[0]?.id ?? '',password:'',password_confirmation:'',change_password:false,fired:false};
      } else {
        data = {...data,...await request(`${api}/${identity}`)};
        form = {...data.item,password:'',password_confirmation:'',change_password:false};
      }
    } catch (failure) { error = failure.message; }
  });
</script>

<div class="container-fluid">
  <h1 class="page-header">{action === 'list' ? 'Пользователи' : action === 'create' ? 'Создать пользователя' : form ? `${form.surname} ${form.name}` : 'Пользователь'}</h1>
  {#if error}<div class="alert alert-danger" role="alert">{error}</div>{/if}
  {#if action === 'list'}
    {#if data.can_create}<a class="btn btn-default" href={`${base}/create`}>Создать пользователя</a>{/if}
    <table class="table table-striped table-bordered table-hover"><thead><tr>{#each [['id','ID'],['surname','ФИО'],['post','Должность'],['phone','Телефон'],['email','E-mail'],['fired','Уволен']] as [key,label]}<th><button class="sort-button" onclick={() => sortBy(key)}>{label}</button></th>{/each}<th>Действия</th></tr></thead><tbody>
      {#each data.items as row}<tr class:warning={row.deleted || row.fired}><td>{row.id}</td><td>{row.surname} {row.name}{#if row.deleted} (удален){/if}</td><td>{row.post}</td><td>{row.phone}</td><td>{row.email}</td><td>{row.fired ? '✓' : ''}</td><td>{#if data.can_edit}<a class="btn btn-xs btn-primary" href={`${base}/${row.id}/edit`}>Редактировать</a>{/if} {#if row.deleted}{#if data.can_restore}<a href={`${base}/${row.id}/restore`}>Восстановить</a>{/if}{#if data.can_delete_trashed}<a href={`${base}/${row.id}/delete`}>Удалить окончательно</a>{/if}{:else if data.can_delete}<a href={`${base}/${row.id}/delete`}>Удалить</a>{/if}</td></tr>{:else}<tr><td colspan="7">Нет пользователей</td></tr>{/each}
    </tbody></table>
    <button class="btn btn-default" disabled={data.page <= 1} onclick={() => load(data.page - 1)}>‹</button> {data.page} / {data.last_page} <button class="btn btn-default" disabled={data.page >= data.last_page} onclick={() => load(data.page + 1)}>›</button>
  {:else if form && action === 'delete'}
    <div class="panel panel-default"><div class="panel-heading">Подтверждение действия</div><div class="panel-body"><p>Вы действительно хотите {form.deleted ? 'удалить окончательно' : 'удалить'} {form.surname} {form.name}?</p>{#if form.deleted ? data.can_delete_trashed : data.can_delete}<button class="btn btn-danger" disabled={busy} onclick={remove}>Удалить</button>{/if} <a class="btn btn-default" href={base}>Отменить</a></div></div>
  {:else if form}
    <form class="reference-form" autocomplete="off" onsubmit={(event) => {event.preventDefault(); save();}}>
      <fieldset disabled={busy || form.deleted || (action !== 'create' && !data.can_edit)}>
        {#each fields as [key,label]}<div class="form-group"><label for={`user_${key}`}>{label}</label><input id={`user_${key}`} name={`user_${key}`} class="form-control" required bind:value={form[key]} />{#if errors[`user_${key}`]}<p>{errors[`user_${key}`]}</p>{/if}</div>{/each}
        <div class="form-group"><label for="user_role">Роль в программе</label><select id="user_role" class="form-control" required bind:value={form.role_id}>{#each data.roles as role}<option value={role.id}>{role.title}</option>{/each}</select>{#if errors.user_role}<p>{errors.user_role}</p>{/if}</div>
        {#if action !== 'create'}<label><input type="checkbox" bind:checked={form.fired} /> Уволен</label><label><input type="checkbox" bind:checked={form.change_password} /> Изменить пароль</label>{/if}
        {#if action === 'create' || form.change_password}<div class="form-group"><label for="user_password">Пароль</label><input id="user_password" class="form-control" type="password" minlength="6" required bind:value={form.password} />{#if errors.user_password}<p>{errors.user_password}</p>{/if}</div><div class="form-group"><label for="user_password_confirmation">Повторите пароль</label><input id="user_password_confirmation" class="form-control" type="password" minlength="6" required bind:value={form.password_confirmation} /></div>{/if}
        <button class="btn btn-primary" type="submit">Сохранить</button>
      </fieldset><a class="btn btn-default" href={base}>Отменить</a>
    </form>
  {:else if !error}<p role="status">Загрузка…</p>{/if}
</div>