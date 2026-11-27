import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('Пользователь', { exact: true }).fill('browser@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
});

async function createOrder(page, type, title) {
  await page.goto(`/orders/add/${type}`);
  await page.getByLabel('Название', { exact: true }).fill(title);
  await page.getByLabel('Тираж', { exact: true }).fill('100');
  if (type === 'wide') {
    await page.getByLabel('Ширина', { exact: true }).fill('2.5');
    await page.getByLabel('Высота', { exact: true }).fill('1.2');
  }
  await page.getByRole('button', { name: 'Создать заказ', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/\d+$/);
  return Number(page.url().split('/').pop());
}

test('F03 preserves production inputs and fixed plate override', async ({ page }) => {
  const orderId = await createOrder(page, 'poly', `F03 poly ${Date.now()}`);
  await page.getByRole('button', { name: 'Заготовки', exact: true }).click();
  await page.getByPlaceholder('Название заготовки').fill('F03 blank');
  await page.getByText('Цвета лица').locator('..').getByRole('spinbutton').fill('4');
  await page.getByText('Цвета оборота').locator('..').getByRole('spinbutton').fill('4');
  await page.getByText('Импозиция: детали на листе').locator('..').getByRole('spinbutton').fill('2');
  await page.getByPlaceholder('Деталей в заготовке').fill('4');
  await page.getByPlaceholder('Разных деталей').fill('3');
  await page.getByText('Комментарии производства').locator('..').locator('textarea').fill('F03 production note');
  await page.getByText('Зафиксировать пластины').locator('..').getByRole('checkbox').check();
  await page.getByLabel('Пластины', { exact: true }).fill('3');
  const created = page.waitForResponse(response => response.url().endsWith(`/api/orders/${orderId}/blanks`) && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Новая заготовка', exact: true }).click();
  const blank = await (await created).json();
  expect(blank).toBeTruthy();
  const detail = await page.evaluate(async ({ order, id }) => (await (await fetch(`/api/orders/${order}/blanks/${id}`)).json()).item, { order: orderId, id: blank.id });
  expect(detail.colors_front).toBe(4);
  expect(detail.colors_back).toBe(4);
  expect(detail.details_per_sheet).toBe(2);
  expect(detail.different_details).toBe(3);
  expect(detail.comments).toBe('F03 production note');
  expect(detail.plates).toBe(3);
  expect(detail.fix_plates).toBe(true);
});

test('F03 persists wide blank dimensions', async ({ page }) => {
  const orderId = await createOrder(page, 'wide', `F03 wide ${Date.now()}`);
  await page.getByRole('button', { name: 'Заготовки', exact: true }).click();
  await page.getByPlaceholder('Название заготовки').fill('F03 wide blank');
  await page.getByText('Ширина заготовки').locator('..').getByRole('spinbutton').fill('2.5');
  await page.getByText('Высота заготовки').locator('..').getByRole('spinbutton').fill('1.2');
  const created = page.waitForResponse(response => response.url().endsWith(`/api/orders/${orderId}/blanks`) && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Новая заготовка', exact: true }).click();
  const blank = await (await created).json();
  expect(blank).toBeTruthy();
  const detail = await page.evaluate(async ({ order, id }) => (await (await fetch(`/api/orders/${order}/blanks/${id}`)).json()).item, { order: orderId, id: blank.id });
  expect(Number(detail.width)).toBeCloseTo(2.5);
  expect(Number(detail.height)).toBeCloseTo(1.2);
});