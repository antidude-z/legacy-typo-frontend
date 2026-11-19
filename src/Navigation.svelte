<script>
  export let menu = [];
  export let user = null;
  export let onLogout;

  let open = false;
</script>

<nav class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <button class="navbar-toggle" type="button" aria-label="Навигация" aria-expanded={open} aria-controls="application-navigation" onclick={() => (open = !open)}>
        <span class="sr-only">Навигация</span>
        <span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="/">Типография</a>
    </div>
    <div id="application-navigation" class:collapse={!open} class="navbar-collapse">
      <ul class="nav navbar-nav">
        {#if user && !menu.some(link => link.link === 'orders')}
          <li><a href="/orders">Заказы</a></li>
        {/if}
        {#each menu as link}
          {#if link.below?.length}
            <li class="dropdown">
              <a href={`/${link.link}`} class="dropdown-toggle">{link.title}</a>
              <ul class="dropdown-menu">
                {#each link.below as subLink}
                  <li><a href={`/${subLink.link}`}>{subLink.title}</a></li>
                {/each}
              </ul>
            </li>
          {:else}
            <li><a href={`/${link.link}`}>{link.title}</a></li>
          {/if}
        {/each}
      </ul>
      <ul class="nav navbar-nav navbar-right">
        {#if user}
          <li class="dropdown"><a href="/" class="dropdown-toggle">{user.surname} {user.name}</a><ul class="dropdown-menu"><li><button class="link-button" onclick={onLogout}>Выход</button></li></ul></li>
        {:else}
          <li><a href="/auth/login">Вход</a></li>
          <li><a href="/auth/register">Регистрация</a></li>
        {/if}
      </ul>
    </div>
  </div>
</nav>
