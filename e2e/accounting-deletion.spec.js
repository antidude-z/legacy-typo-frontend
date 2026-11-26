import { test, expect } from '@playwright/test';

test('S06 bill editor can save but cannot delete bills or payments', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('Пользователь', { exact: true }).selectOption('bill-editor@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
  const token = (await (await page.request.get('/api/csrf-token')).json()).token;
  const headers = { 'X-CSRF-Token': token };
  const bill = await page.request.post('/api/accounting/bills', { headers,
    data: { number: 'S06 synthetic', bill_date: '2026-01-01', amount: '10', currency: 'RUB' } });
  expect(bill.status()).toBe(200);
  const id = (await bill.json()).id;
  const payment = await page.request.post(`/api/accounting/bills/${id}/payments`, { headers,
    data: { payment_date: '2026-01-01', amount: '5' } });
  expect(payment.status()).toBe(200);
  const paymentId = (await payment.json()).id;
  await page.goto(`/accounting/bills/${id}/edit`);
  await expect(page.getByLabel('Номер счета', { exact: true })).toHaveValue('S06 synthetic');
  await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toBeEnabled();
  await expect(page.getByRole('link', { name: /^Удалить/ })).toHaveCount(0);
  await page.goto(`/accounting/bills/${id}/delete`);
  await expect(page.getByRole('button', { name: 'Удалить', exact: true })).toBeDisabled();
  await page.goto(`/accounting/bills/${id}/payments/${paymentId}/delete`);
  await expect(page.getByText('Вы действительно хотите', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Удалить', exact: true })).toHaveCount(0);
  expect((await page.request.delete(`/api/accounting/bills/${id}`, { headers })).status()).toBe(403);
  expect((await page.request.delete(`/api/accounting/bills/${id}/payments/${paymentId}`, { headers })).status()).toBe(403);
});