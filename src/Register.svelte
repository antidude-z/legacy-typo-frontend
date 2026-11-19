<script>
  let form = { name: '', email: '', password: '', password_confirmation: '' };
  let error = '';
  let busy = false;
  async function submit() {
    busy = true; error = '';
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', body: new URLSearchParams(form), redirect: 'manual' });
      if (response.status === 303 || response.type === 'opaqueredirect') { window.location.href = '/orders'; return; }
      error = (await response.json()).message ?? 'Не удалось зарегистрироваться.';
    } catch {
      error = 'Ошибка сети. Проверьте соединение и повторите попытку.';
    } finally { busy = false; }
  }
</script>
<div class="container-fluid"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="panel panel-default"><div class="panel-heading">Регистрация</div><div class="panel-body">
  {#if error}<div class="alert alert-danger">{error}</div>{/if}
  <form onsubmit={(event) => { event.preventDefault(); submit(); }}>
    <label>Имя<input class="form-control" required maxlength="255" bind:value={form.name} /></label>
    <label>Email<input class="form-control" required type="email" maxlength="255" bind:value={form.email} /></label>
    <label>Пароль<input class="form-control" required minlength="6" type="password" bind:value={form.password} /></label>
    <label>Повторите пароль<input class="form-control" required minlength="6" type="password" bind:value={form.password_confirmation} /></label>
    <button class="btn btn-primary" disabled={busy}>Зарегистрироваться</button> <a class="btn btn-default" href="/auth/login">Отмена</a>
  </form>
</div></div></div></div></div>