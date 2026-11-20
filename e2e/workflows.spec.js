import { test, expect } from '@playwright/test';

test('historical missing selector values survive unrelated browser edits', async ({ page }) => {
  test.skip(Boolean(process.env.BROWSER_QA_URL), 'Uses dedicated local orphan fixtures');
  await page.goto('/accounting/bills/88001/edit');
  await expect(page.locator('#bill_payer')).toHaveValue('88002');
  await expect(page.locator('#bill_manager')).toHaveValue('88003');
  const saved = page.waitForResponse(response => response.url().endsWith('/api/accounting/bills/88001') && response.request().method() === 'PATCH');
  await page.locator('button[type="submit"]').click();
  expect((await saved).status()).toBe(200);
  await expect(page).toHaveURL(/\/accounting\/bills$/);
  await page.goto('/accounting/bills/88001/edit');
  await expect(page.locator('#bill_payer')).toHaveValue('88002');
  await page.goto('/references/customers/88001/edit');
  await expect(page.locator('#customer_customer_group_id')).toHaveValue('88002');
  const customerSaved = page.waitForResponse(response => response.url().endsWith('/api/customer-references/88001') && response.request().method() === 'PATCH');
  await page.locator('button[type="submit"]').click();
  expect((await customerSaved).status()).toBe(200);
});

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
  await expect(page).toHaveURL(/\/references\/prepresses\/?(?:\?|$)/);
  await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
  for (const path of ['/references/paper', '/references/materials', '/references/printers', '/references/afterprints', '/references/compiles', '/references/customers', '/references/users', '/accounting/payers', '/accounting/bills', '/prices/paper', '/options/reports', '/options/permissions', '/reports/payrolls/create']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Раздел ожидает переноса функциональности.')).toHaveCount(0);
    await expect(page.locator('[role="alert"]')).toHaveCount(0);
  }
});

test('blank and prepress create/edit/delete/restore', async ({ page }) => {
  await page.goto('/orders/add/poly');
  await page.getByLabel('Название', { exact: true }).fill('Browser production');
  await page.getByRole('button', { name: 'Создать заказ', exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/\d+$/);
  await page.getByRole('button', { name: 'Заготовки', exact: true }).click();
  await page.getByPlaceholder('Название заготовки').fill('Browser blank');
  await page.getByRole('button', { name: 'Новая заготовка', exact: true }).click();
  const blank = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Browser blank', exact: true }) });
  await expect(blank).toBeVisible();
  await blank.getByRole('button', { name: 'Изменить', exact: true }).click();
  await page.getByPlaceholder('Название заготовки').fill('Browser blank edited');
  await page.getByRole('button', { name: 'Сохранить заготовку' }).click();
  await expect(page.getByRole('cell', { name: 'Browser blank edited', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Дизайн/препресс', exact: true }).click();
  const section = page.locator('.operation-panel').filter({ has: page.locator('.panel-heading', { hasText: 'Дизайн/препресс' }) });
  await section.locator('select').selectOption({ label: 'Browser prepress' });
  await section.getByRole('spinbutton').fill('1');
  expect(await section.locator('form').evaluate(form => [...form.elements].filter(item => !item.checkValidity()).map(item => ({ html: item.outerHTML, message: item.validationMessage })))).toEqual([]);
  await section.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(section.getByRole('cell', { name: 'Browser prepress', exact: true })).toBeVisible();
  await section.getByRole('button', { name: 'Изменить', exact: true }).click();
  await section.getByRole('spinbutton').fill('3');
  await section.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(section.getByRole('cell', { name: /^3(?:\.0+)?$/ })).toBeVisible();
  await section.getByRole('button', { name: 'Удалить', exact: true }).click();
  await section.getByRole('button', { name: 'Восстановить', exact: true }).click();
  await expect(section.getByRole('button', { name: 'Изменить', exact: true })).toBeVisible();
});

test('bill, payment edit and report form downloads', async ({ page }) => {
  await page.goto('/accounting/bills/create');
  const number = `E2E-${Date.now()}`;
  await page.getByLabel('Номер счета', { exact: true }).fill(number);
  await page.getByLabel('Дата счета', { exact: true }).fill('2026-01-15');
  await page.getByLabel('Сумма счета', { exact: true }).fill('125.50');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page).toHaveURL(/\/accounting\/bills(?:\?|$)/);
  const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: number, exact: true }) });
  const editURL = await row.getByRole('link', { name: 'Редактировать', exact: true }).getAttribute('href');
  await page.goto(editURL);
  const id = new URL(page.url()).pathname.split('/')[3];
  await page.getByRole('button', { name: 'Новый платеж' }).click();
  await page.getByLabel('Сумма платежа', { exact: true }).fill('25.50');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/accounting/bills/${id}/edit$`));
  await expect(page.getByText('Итого оплачено:')).toContainText('25.50');
  await page.getByRole('button', { name: 'Заявка на оплату', exact: true }).click();
  await page.getByLabel('Институт, подразделение, кафедра', { exact: true }).fill('Browser institute');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Сформировать', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.xls$/);
  await page.getByRole('button', { name: 'Документ на отгрузку', exact: true }).click();
  await expect(page.getByLabel('Бухгалтер', { exact: true }).locator('option')).not.toHaveCount(0);
  const shipping = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Сформировать', exact: true }).click();
  expect((await shipping).suggestedFilename()).toMatch(/\.pdf$/);
});

test('payroll create, save and workbook download', async ({ page }) => {
  await page.goto('/reports/payrolls/create');
  await page.getByLabel('Менеджер', { exact: true }).selectOption({ label: 'QA Browser' });
  await page.getByLabel('Год', { exact: true }).fill('2026');
  await page.getByRole('button', { name: 'Перейти', exact: true }).click();
  await expect(page).toHaveURL(/\/reports\/payrolls\/\d+$/);
  await page.getByLabel('Оклад', { exact: true }).fill('1000');
  const saved = page.waitForResponse(response => response.request().method() === 'PATCH' && response.url().includes('/api/reports/payrolls/'));
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  expect((await saved).ok()).toBeTruthy();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Экспорт XLS', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/payroll-\d+\.xls$/);
});

test('failed save keeps entered order data', async ({ page }) => {
  await page.goto('/orders/add/poly');
  await page.getByLabel('Название', { exact: true }).fill('Unsaved input');
  await page.route('**/api/orders/add/poly', route => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ message: 'Rejected fixture' }) }));
  await page.getByRole('button', { name: 'Создать заказ', exact: true }).click();
  await expect(page.locator('.alert-danger')).toBeVisible();
  await expect(page.getByLabel('Название', { exact: true })).toHaveValue('Unsaved input');
  await expect(page.getByRole('button', { name: 'Создать заказ', exact: true })).toBeEnabled();
});