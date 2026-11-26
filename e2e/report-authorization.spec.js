import { test, expect } from '@playwright/test';

async function login(page, email) {
  await page.goto('/auth/login');
  await page.getByLabel('Пользователь', { exact: true }).selectOption(email);
  await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
}

test('S05 Orders reader cannot discover or download bill documents', async ({ page, browser }) => {
  await login(page, 'browser@example.test');
  const token = (await (await page.request.get('/api/csrf-token')).json()).token;
  const created = await page.request.post('/api/accounting/bills', {
    headers: { 'X-CSRF-Token': token },
    data: { number: 'S05 synthetic', bill_date: '2026-01-01', amount: '10.00', currency: 'RUB' },
  });
  expect(created.status()).toBe(200);
  const id = (await created.json()).id;
  expect((await page.request.get(`/api/reports/form/order_payment/${id}`)).status()).toBe(200);
  expect((await page.request.get(`/reports/order_payment/item/${id}`)).status()).toBe(200);
  const context = await browser.newContext();
  try {
    const reader = await context.newPage();
    await login(reader, 'reader@example.test');
    for (const path of [`/api/reports/for/bills/${id}`, `/api/reports/bills/${id}/orders`,
      `/api/reports/form/order_payment/${id}`, `/reports/order_payment/item/${id}`]) {
      const response = await reader.request.get(path);
      expect(response.status()).toBe(403);
      expect(response.headers()['content-disposition']).toBeUndefined();
    }
    const readerToken = (await (await reader.request.get('/api/csrf-token')).json()).token;
    expect((await reader.request.post(`/reports/order_payment/item/${id}`, {
      headers: { 'X-CSRF-Token': readerToken }, form: { 'vars[customer]': 'Synthetic' },
    })).status()).toBe(403);
  } finally {
    await context.close();
  }
});