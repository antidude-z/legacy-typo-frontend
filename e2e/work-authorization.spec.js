import { test, expect } from '@playwright/test';

async function login(page, email) {
  await page.goto('/auth/login');
  await page.getByLabel('Пользователь', { exact: true }).selectOption(email);
  await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
}

test('S03 work catalogs enforce writer and reader capabilities', async ({ page, browser }) => {
  await login(page, 'browser@example.test');
  const readerContext = await browser.newContext();
  const reader = await readerContext.newPage();
  const errors = [];
  reader.on('pageerror', error => errors.push(error.message));
  try {
    await login(reader, 'catalog-reader@example.test');
    await expect(reader.getByRole('alert')).toContainText('Недостаточно прав');
    for (const kind of ['prepresses', 'redactions']) {
      const title = `S03 ${kind} ${Date.now()}`;
      await page.goto(`/references/${kind}/create`);
      await page.getByLabel('Название работы').fill(title);
      await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/references/${kind}(?:\\?|$)`));
      const row = page.getByRole('row').filter({ hasText: title });
      const edit = await row.getByRole('link', { name: 'Редактировать', exact: true }).getAttribute('href');
      await expect(row.getByRole('link', { name: 'Удалить', exact: true })).toBeVisible();
      await reader.goto(`/references/${kind}`);
      await expect(reader.getByRole('cell', { name: title, exact: true })).toBeVisible();
      await expect(reader.getByRole('link', { name: 'Новая работа', exact: true })).toHaveCount(0);
      await expect(reader.getByRole('link', { name: 'Удалить', exact: true })).toHaveCount(0);
      await reader.goto(edit);
      await expect(reader.getByLabel('Название работы')).toHaveValue(title);
      await expect(reader.getByLabel('Название работы')).toBeDisabled();
      await expect(reader.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCount(0);
      const identity = edit.split('/')[3];
      const denied = await reader.evaluate(async ({ kind, identity }) => {
        const token = (await (await fetch('/api/csrf-token')).json()).token;
        return (await fetch(`/api/reference-works/${kind}/${identity}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': token },
          body: JSON.stringify({ title: 'Unauthorized change' }),
        })).status;
      }, { kind, identity });
      expect(denied).toBe(403);
      await reader.goto(`/references/${kind}/create`);
      await expect(reader.getByRole('alert')).toBeVisible();
      await expect(reader.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCount(0);
      await page.goto(edit);
      await expect(page.getByLabel('Название работы')).toHaveValue(title);
      await page.getByLabel('Название работы').fill(title + ' updated');
      await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/references/${kind}(?:\\?|$)`));
      await expect(page.getByRole('cell', { name: title + ' updated', exact: true })).toBeVisible();
    }
    expect(errors).toEqual([]);
  } finally {
    await readerContext.close();
  }
});

test('S03 Orders reader has read-only fields and operation controls', async ({ page, browser }) => {
  await login(page, 'browser@example.test');
  await page.goto('/orders/add/poly');
  await page.getByLabel('Название', { exact: true }).fill('S03 reader order');
  await page.getByRole('button', { name: 'Создать заказ', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/\d+$/);
  const orderURL = page.url();
  const context = await browser.newContext();
  try {
    const reader = await context.newPage();
    await login(reader, 'reader@example.test');
    await expect(reader.getByRole('button', { name: /Новый заказ/ })).toHaveCount(0);
    await reader.goto(orderURL);
    await expect(reader.getByLabel('Название', { exact: true })).toBeDisabled();
    await expect(reader.getByRole('button', { name: 'Сохранить', exact: true })).toHaveCount(0);
    await expect(reader.getByRole('button', { name: 'Удалить', exact: true })).toHaveCount(0);
    await expect(reader.getByRole('button', { name: 'Пересчитать', exact: true })).toHaveCount(0);
    await reader.getByRole('button', { name: 'Дизайн/препресс', exact: true }).click();
    await expect(reader.locator('.operation-panel')).toHaveCount(4);
    await expect(reader.locator('.operation-form')).toHaveCount(0);
    await reader.getByRole('button', { name: 'Заготовки', exact: true }).click();
    await expect(reader.locator('.blank-form')).toHaveCount(0);
    for (const path of ['/orders/add/poly', new URL(orderURL).pathname + '/copy']) {
      await reader.goto(path);
      await expect(reader.locator('.alert-danger')).toBeVisible();
      await expect(reader.locator('button[type="submit"]')).toHaveCount(0);
    }
  } finally {
    await context.close();
  }
});

test('S03 authorized blank trash lifecycle preserves the same blank', async ({ page }) => {
  await login(page, 'browser@example.test');
  await page.goto('/orders/add/poly');
  await page.getByLabel('Название', { exact: true }).fill('S03 blank lifecycle');
  await page.getByRole('button', { name: 'Создать заказ', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/\d+$/);
  await page.getByRole('button', { name: 'Заготовки', exact: true }).click();
  await page.getByPlaceholder('Название заготовки').fill('S03 disposable blank');
  await page.getByRole('button', { name: 'Новая заготовка', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: 'S03 disposable blank' });
  await expect(row).toHaveCount(1);
  await row.getByRole('button', { name: 'Удалить', exact: true }).click();
  await expect(row.getByRole('button', { name: 'Восстановить', exact: true })).toBeVisible();
  await expect(row.getByRole('button', { name: 'Изменить', exact: true })).toHaveCount(0);
  await row.getByRole('button', { name: 'Восстановить', exact: true }).click();
  await expect(row.getByRole('button', { name: 'Изменить', exact: true })).toBeVisible();
  await expect(row).toHaveCount(1);
  await row.getByRole('button', { name: 'Удалить', exact: true }).click();
  await row.getByRole('button', { name: 'Удалить окончательно', exact: true }).click();
  await expect(row).toHaveCount(0);
});