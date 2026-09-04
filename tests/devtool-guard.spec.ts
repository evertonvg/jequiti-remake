import { test, expect } from '@playwright/test';

// These two tests deliberately use Playwright's base `test` (not the
// suspended fixture in ./fixtures) because they verify disable-devtool's
// real, un-suspended behavior. Note: Playwright's own CDP connection is
// treated as "devtools-like" by the library (confirmed during development),
// so the right-click check below must run immediately after navigation,
// before the library's detection interval (200ms) has a chance to redirect.

test('right-click context menu is blocked', async ({ page }) => {
  await page.goto('./');
  const prevented = await page.evaluate(() => {
    const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    document.dispatchEvent(ev);
    return ev.defaultPrevented;
  });
  expect(prevented).toBe(true);
});

test('DevTools-open detection redirects away', async ({ page }) => {
  await page.goto('./');
  await page.waitForURL(/letmegooglethat\.com/, { timeout: 5000 });
  expect(page.url()).toContain('letmegooglethat.com');
});
