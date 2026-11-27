import { test, expect } from '@playwright/test';

test('S12 generic registration does not disclose existence or sign users in', async ({ page }) => {
  test.skip(process.env.BROWSER_QA_REGISTRATION !== '1', 'Requires owned opt-in registration fixture');
  for (const email of ['browser@example.test', 'new-pending@example.test']) {
    await page.goto('/auth/register');
    await page.getByLabel('Имя', { exact: true }).fill('Pending');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Пароль', { exact: true }).fill('Browser-test-123');
    await page.getByLabel('Повторите пароль', { exact: true }).fill('Browser-test-123');
    await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Если регистрация возможна');
    expect((await (await page.request.get('/api/session')).json()).authenticated).toBe(false);
    await expect(page).toHaveURL(/\/auth\/register$/);
  }
});