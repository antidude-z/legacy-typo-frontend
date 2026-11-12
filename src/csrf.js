let token = null;
let loading = null;

async function csrfToken() {
  if (token) return token;
  if (!loading) {
    loading = fetch('/api/csrf-token', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Не удалось получить CSRF-токен.');
        const payload = await response.json();
        token = payload.token;
        return token;
      })
      .finally(() => { loading = null; });
  }
  return loading;
}

export function installCsrfFetch() {
  const original = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input, init = {}) => {
    const method = String(init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method) || input === '/api/csrf-token') {
      return original(input, { ...init, credentials: init.credentials || 'same-origin' });
    }
    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    headers.set('X-CSRF-Token', await csrfToken());
    return original(input, { ...init, headers, credentials: init.credentials || 'same-origin' });
  };
}

export function resetCsrfToken() {
  token = null;
}