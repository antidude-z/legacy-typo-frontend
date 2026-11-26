import { test, expect } from '@playwright/test';

async function login(page, email) {
  await page.goto('/auth/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
}

test('limited role cannot administer permissions or accounting', async ({ page }) => {
  await login(page, 'reader@example.test');
  for (const path of ['/options/permissions', '/accounting/bills']) {
    await page.goto(path);
    await expect(page.locator('.alert-danger')).toBeVisible();
  }
});

test('network failure retains input and allows retry', async ({ page }) => {
  await login(page, 'browser@example.test');
  await page.goto('/orders/add/poly');
  await page.getByLabel('Название', { exact: true }).fill('Network retry');
  await page.route('**/api/orders/add/poly', route => route.abort('failed'));
  await page.getByRole('button', { name: 'Создать заказ', exact: true }).click();
  await expect(page.locator('.alert-danger')).toBeVisible();
  await expect(page.getByLabel('Название', { exact: true })).toHaveValue('Network retry');
  await page.unroute('**/api/orders/add/poly');
  await page.getByRole('button', { name: 'Создать заказ', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/\d+$/);
});