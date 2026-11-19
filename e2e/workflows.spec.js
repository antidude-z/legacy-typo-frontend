import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.locator('#email option[value="browser@example.test"]')).toBeAttached();
  await page.getByLabel('Пользователь', { exact: true }).selectOption('browser@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
});

for (const kind of ['book', 'poly', 'wide', 'souvenir']) {
  test(`create, edit, copy and switch tabs: ${kind}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/orders/add/${kind}`);
    const title = `Browser ${kind} ${Date.now()}`;
    await page.getByLabel('Название', { exact: true }).fill(title);
    await page.getByLabel('Тираж', { exact: true }).fill('100');
    if (kind === 'book') await page.getByLabel('Объем', { exact: true }).fill('32');
    await page.getByRole('button', { name: 'Создать заказ', exact: true }).click();
    await expect(page).toHaveURL(/\/orders\/\d+$/);
    const orderURL = page.url();
    await expect(page.locator('h1')).toContainText(title);
    await page.locator('#detail_title').fill(title + ' edited');
    await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
    await expect(page).toHaveURL(/\/orders$/);
    await page.goto(orderURL);
    await expect(page.locator('#detail_title')).toHaveValue(title + ' edited');
    for (const name of ['Дизайн/препресс', 'Сборка', 'Прочие работы', 'Заготовки', 'История', 'Общие сведения']) {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.locator('.nav-tabs-static li.active')).toHaveText(name);
    }
    await page.goto(orderURL + '/copy');
    await expect(page.getByLabel('Название', { exact: true })).toHaveValue(title + ' edited');
    await page.getByRole('button', { name: 'Копировать заказ', exact: true }).click();
    await expect(page).toHaveURL(/\/orders\/\d+$/);
    expect(page.url()).not.toBe(orderURL);
    expect(errors).toEqual([]);
  });
}

test('reference creation and application section navigation', async ({ page }) => {
  await page.goto('/references/prepresses/create');
  const title = `Browser reference ${Date.now()}`;
  await page.getByLabel('Название работы', { exact: true }).fill(title);
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page).toHaveURL(/\/references\/prepresses\/?$/);
  await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
  for (const path of ['/references/paper', '/references/materials', '/references/printers', '/references/afterprints', '/references/compiles', '/references/customers', '/references/users', '/accounting/payers', '/accounting/bills', '/prices/paper', '/options/reports', '/options/permissions', '/reports/payrolls/create']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Раздел ожидает переноса функциональности.')).toHaveCount(0);
    await expect(page.locator('[role="alert"]')).toHaveCount(0);
  }
});