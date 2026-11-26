import { test, expect } from '@playwright/test';

async function login(page, email) {
  await page.goto('/auth/login');
  await page.getByLabel('Пользователь', { exact: true }).selectOption(email);
  await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page).toHaveURL(/\/orders$/);
}

test('S04 explicit role selection and profile-only employee controls', async ({ page, browser }) => {
  await login(page, 'browser@example.test');
  await page.goto('/references/users/create');
  await expect(page.getByLabel('Роль в программе')).toHaveValue('');
  await page.getByLabel('Фамилия', { exact: true }).fill('Delegation');
  await page.getByLabel('Имя', { exact: true }).fill('Employee');
  await page.getByLabel('Должность', { exact: true }).fill('QA');
  await page.getByLabel('Телефон', { exact: true }).fill('123');
  await page.getByLabel('E-mail', { exact: true }).fill('s04-created@example.test');
  await page.getByLabel('Роль в программе').selectOption({ label: 'Browser Orders reader' });
  await page.getByLabel('Пароль', { exact: true }).fill('Test-secret-123');
  await page.getByLabel('Повторите пароль', { exact: true }).fill('Test-secret-123');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page).toHaveURL(/\/references\/users$/);
  const row = page.getByRole('row').filter({ hasText: 's04-created@example.test' });
  const edit = await row.getByRole('link', { name: 'Редактировать', exact: true }).getAttribute('href');
  const context = await browser.newContext();
  try {
    const editor = await context.newPage();
    await login(editor, 'profile-editor@example.test');
    await editor.goto(edit);
    await expect(editor.getByLabel('E-mail', { exact: true })).toBeDisabled();
    await expect(editor.getByLabel('Роль в программе')).toHaveCount(0);
    await expect(editor.getByLabel('Изменить пароль')).toHaveCount(0);
    await expect(editor.getByLabel('Уволен', { exact: true })).toHaveCount(0);
    await editor.getByLabel('Должность', { exact: true }).fill('Profile-only update');
    await editor.getByRole('button', { name: 'Сохранить', exact: true }).click();
    await expect(editor).toHaveURL(/\/references\/users$/);
    await editor.goto(edit);
    await expect(editor.getByLabel('Должность', { exact: true })).toHaveValue('Profile-only update');
  } finally {
    await context.close();
  }
});