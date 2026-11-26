import { test, expect } from '@playwright/test';

test('S12 typed login never fetches or exposes the staff roster', async ({ page }) => {
  const rosterRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/auth/users') rosterRequests.push(request.url());
  });
  await page.goto('/auth/login');
  const email = page.getByLabel('Пользователь', { exact: true });
  await expect(email).toHaveAttribute('type', 'email');
  await expect(email).toHaveValue('');
  await expect(page.locator('select#email')).toHaveCount(0);
  await email.fill('browser@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders/);
  expect(rosterRequests).toEqual([]);
  const response = await page.request.get('/api/auth/users');
  expect(await response.json()).toEqual({});
  expect(response.headers()['cache-control']).toBe('no-store');
});