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
  try {
    await login(reader, 'catalog-reader@example.test');
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
  } finally {
    await readerContext.close();
  }
});