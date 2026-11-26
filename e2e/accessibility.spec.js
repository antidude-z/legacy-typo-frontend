import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [375, 768, 1440]) {
  test(`responsive accessibility: ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    const audit = async (name) => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      await testInfo.attach(`${name}-${width}.json`, { body: JSON.stringify(result.violations, null, 2), contentType: 'application/json' });
      if (result.violations.length) console.log(JSON.stringify({ name, violations: result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ html: n.html, checks: n.any })) })) }));
      expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    };
    await page.goto('/auth/login');
    await expect(page.locator('#email')).toBeVisible();
    await audit('login');
    await page.locator('#email').fill('browser@example.test');
    await page.locator('#password').fill('Browser-test-123');
    await page.getByRole('button', { name: 'Войти', exact: true }).click();
    await expect(page).toHaveURL(/\/orders$/);
    await audit('orders');
    if (width < 768) {
      const toggle = page.getByRole('button', { name: 'Навигация', exact: true });
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('.navbar-collapse')).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
    for (const path of ['/orders/add/book', '/accounting/bills', '/references/prepresses', '/reports/payrolls/create']) {
      await page.goto(path);
      await expect(page.locator('form:visible, table:visible').first()).toBeVisible();
      await audit(path.replaceAll('/', '-'));
    }
  });
}