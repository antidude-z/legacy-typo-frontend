<script>
  export let users = {};
  export let error = '';
  export let onSubmit;
  export let registrationEnabled = false;

  let email = Object.keys(users)[0] ?? '';
  let password = '';
  let remember = false;
</script>

<div class="container-fluid">
  <div class="row"><div class="col-md-8 col-md-offset-2">
    <div class="panel panel-default">
      <div class="panel-heading">Вход в систему</div>
      <div class="panel-body">
        {#if error}<div class="alert alert-danger">{error}</div>{/if}
        <form class="form-horizontal" onsubmit={(event) => { event.preventDefault(); onSubmit({ email, password, remember }); }}>
          <div class="form-group"><label class="col-md-4 control-label" for="email">Пользователь</label><div class="col-md-6"><select class="form-control" id="email" bind:value={email}>{#each Object.entries(users) as [value, title]}<option {value}>{title}</option>{/each}</select></div></div>
          <div class="form-group"><label class="col-md-4 control-label" for="password">Пароль</label><div class="col-md-6"><input class="form-control" id="password" type="password" bind:value={password} /></div></div>
          <div class="form-group"><div class="col-md-6 col-md-offset-4"><label><input type="checkbox" bind:checked={remember} /> Запомнить меня</label></div></div>
          <div class="form-group"><div class="col-md-6 col-md-offset-4"><button class="btn btn-primary" type="submit">Войти</button> <a href="/password/email">Забыли пароль?</a> {#if registrationEnabled}<a href="/auth/register">Регистрация</a>{/if}</div></div>
        </form>
      </div>
    </div>
  </div></div>
</div>
