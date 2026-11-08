export function authRoute(path) {
  if (path === '/auth/register' || path === '/auth/register/') return { kind: 'register' };
  if (path === '/password/email' || path === '/password/email/') return { kind: 'request' };
  const reset = /^\/password\/reset\/([^/]+)\/?$/.exec(path);
  if (reset) return { kind: 'reset', token: reset[1] };
  return null;
}