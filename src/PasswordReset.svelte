<script>
  export let kind = 'request';
  export let token = '';
  let email = '';
  let password = '';
  let password_confirmation = '';
  let message = '';
  let error = '';
  let busy = false;
  async function submit() {
    busy = true; error = ''; message = '';
    const values = kind === 'request' ? { email } : { email, token, password, password_confirmation };
    const endpoint = kind === 'request' ? '/api/password/email' : '/api/password/reset';
    const response = await fetch(endpoint, { method: 'POST', body: new URLSearchParams(values), redirect: 'manual' });
    if (response.status === 303) { window.location.href = '/auth/login'; return; }
    const data = await response.json();
    if (response.ok) message = data.message; else error = data.message ?? 'Операция не выполнена.';
    busy = false;
  }
</script>
<div class="container-fluid"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="panel panel-default"><div class="panel-heading">{kind === 'request' ? 'Сброс пароля' : 'Новый пароль'}</div><div class="panel-body">
  {#if error}<div class="alert alert-danger">{error}</div>{/if}{#if message}<div class="alert alert-success">{message}</div>{/if}
  <form onsubmit={(event) => { event.preventDefault(); submit(); }}>
    <label>Email<input class="form-control" required type="email" bind:value={email} /></label>
    {#if kind === 'reset'}<label>Новый пароль<input class="form-control" required minlength="6" type="password" bind:value={password} /></label><label>Повторите пароль<input class="form-control" required minlength="6" type="password" bind:value={password_confirmation} /></label>{/if}
    <button class="btn btn-primary" disabled={busy}>{kind === 'request' ? 'Отправить инструкцию' : 'Сохранить пароль'}</button> <a class="btn btn-default" href="/auth/login">Отмена</a>
  </form>
</div></div></div></div></div>