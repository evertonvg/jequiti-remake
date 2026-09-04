import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.__DISABLE_DEVTOOL_SUSPEND__ = true;
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
