import { test, expect } from '@playwright/test';

test('disabled registration and pending account cannot open business screens', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth\/login$/);
  await page.goto('/auth/register');
  await expect(page.getByText('Регистрация отключена.', { exact: false })).toBeVisible();
  await expect(page.locator('form')).toHaveCount(0);
  await page.goto('/auth/login');
  await page.locator('#email').fill('limited@example.test');
  await page.locator('#password').fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.locator('.navbar a[href="/orders"]')).toHaveCount(0);
  await expect(page.getByText('Доступ ожидает одобрения', { exact: false })).toBeVisible();
  await page.goto('/');
  await expect(page).toHaveURL(/\/orders$/);
  await page.goto('/options/main');
  await expect(page.getByText('Доступ ожидает одобрения', { exact: false })).toBeVisible();
  expect((await page.request.get('/api/orders')).status()).toBe(403);
});

test('main options and independent order dropdown/filter', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('#email').fill('browser@example.test');
  await page.locator('#password').fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
  const create = page.getByRole('button', { name: /Новый заказ/ });
  const filter = page.getByRole('button', { name: /Поиск-фильтр/ });
  await create.click();
  await expect(create).toHaveAttribute('aria-expanded', 'true');
  await expect(filter).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('link', { name: 'Сувенирная продукция', exact: true })).toBeVisible();
  await filter.click();
  await expect(create).toHaveAttribute('aria-expanded', 'true');
  await expect(filter).toHaveAttribute('aria-expanded', 'true');
  await create.click();
  await expect(filter).toHaveAttribute('aria-expanded', 'true');
  await page.goto('/options/main');
  await expect(page.getByRole('heading', { name: 'Основные настройки' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'min_markup', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: 'max_markup', exact: true })).toBeVisible();
});