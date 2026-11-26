import { test, expect } from '@playwright/test';

test('S07 employee reset revokes a remembered browser session', async ({ browser, page }) => {
  async function login(target, email, password, remember = false) {
    const token = (await (await target.request.get('/api/csrf-token')).json()).token;
    return target.request.post('/api/auth/login', { headers: { 'X-CSRF-Token': token },
      form: { email, password, remember: String(remember) }, maxRedirects: 0 });
  }
  const context = await browser.newContext();
  try {
    const reader = await context.newPage();
    expect((await login(reader, 'reader@example.test', 'Browser-test-123', true)).status()).toBe(303);
    const oldCookies = await context.cookies();
    const session = (await (await reader.request.get('/api/session')).json());
    expect(session.authenticated).toBe(true);
    expect((await login(page, 'browser@example.test', 'Browser-test-123')).status()).toBe(303);
    const staff = await (await page.request.get('/api/employee-references?per_page=200')).json();
    const employee = staff.items.find(row => row.email === 'reader@example.test');
    expect(employee).toBeTruthy();
    const token = (await (await page.request.get('/api/csrf-token')).json()).token;
    const reset = await page.request.patch(`/api/employee-references/${employee.id}`, {
      headers: { 'X-CSRF-Token': token }, data: { ...employee, surname: 'QA', phone: '123', post: 'QA',
        change_password: true, password: 'New-browser-123', password_confirmation: 'New-browser-123' },
    });
    expect(reset.status()).toBe(200);
    await context.clearCookies();
    await context.addCookies(oldCookies);
    expect((await (await reader.request.get('/api/session')).json()).authenticated).toBe(false);
    await context.clearCookies();
    await context.addCookies(oldCookies.filter(cookie => cookie.name === 'typography_remember'));
    expect((await (await reader.request.get('/api/session')).json()).authenticated).toBe(false);
    expect((await login(reader, 'reader@example.test', 'Browser-test-123')).status()).toBe(422);
    expect((await login(reader, 'reader@example.test', 'New-browser-123')).status()).toBe(303);
    // Restore only the synthetic fixture password for subsequent browser tests.
    expect((await page.request.patch(`/api/employee-references/${employee.id}`, {
      headers: { 'X-CSRF-Token': token }, data: { ...employee, surname: 'QA', phone: '123', post: 'QA',
        change_password: true, password: 'Browser-test-123', password_confirmation: 'Browser-test-123' },
    })).status()).toBe(200);
  } finally {
    await context.close();
  }
});