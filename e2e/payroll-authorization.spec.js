import { test, expect } from '@playwright/test';

test('S10 payroll reader sees disabled mutation controls and API denies writes', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('Пользователь', { exact: true }).selectOption('payroll-reader@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
  await page.goto('/reports/payrolls/88001');
  await expect(page.getByLabel('Оклад', { exact: true })).toHaveValue('123.00');
  await expect(page.getByLabel('Оклад', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('Статус', { exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Сохранить', exact: true })).toBeDisabled();
  const token = (await (await page.request.get('/api/csrf-token')).json()).token;
  const headers = { 'X-CSRF-Token': token };
  expect((await page.request.patch('/api/reports/payrolls/88001', {
    headers, data: { salary: 999, status: 'paid' },
  })).status()).toBe(403);
  const response = await page.request.get('/api/reports/payrolls/88001');
  expect((await response.json()).item.salary).toBe('123.00');
  await page.goto('/reports/payrolls/create');
  await expect(page.getByRole('button', { name: 'Перейти', exact: true })).toBeDisabled();
});