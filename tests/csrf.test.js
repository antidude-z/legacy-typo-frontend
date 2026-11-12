import test from 'node:test';
import assert from 'node:assert/strict';
import { installCsrfFetch } from '../src/csrf.js';

test('csrf fetch wrapper gets a token and adds it to mutations', async () => {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    calls.push([url, options]);
    if (url === '/api/csrf-token') return new Response(JSON.stringify({ token: 'token-1' }), { status: 200 });
    return new Response('{}', { status: 200 });
  };
  try {
    installCsrfFetch();
    await globalThis.fetch('/api/example', { method: 'POST', body: '{}' });
    assert.equal(calls[0][0], '/api/csrf-token');
    assert.equal(calls[1][1].headers.get('X-CSRF-Token'), 'token-1');
  } finally {
    globalThis.fetch = original;
  }
});