import { test, expect } from './fixtures';

async function typeSecretWord(page: import('@playwright/test').Page) {
  for (const ch of 'jequiti') {
    await page.keyboard.press(`Key${ch.toUpperCase()}`);
  }
  await page.waitForTimeout(200);
}

test('typing "jequiti" opens the secret terminal with the English question', async ({ page }) => {
  await page.goto('./');
  await typeSecretWord(page);
  await expect(page.locator('.secret-terminal')).toHaveClass(/secret-terminal--active/);
  await expect(page.locator('.secret-terminal__output')).toHaveText('What is the meaning of life?');
});

test('answer "DVD" is echoed and closes the terminal', async ({ page }) => {
  await page.goto('./');
  await typeSecretWord(page);
  await page.locator('.secret-terminal__input').fill('DVD');
  await page.keyboard.press('Enter');

  await expect(page.locator('.secret-terminal__output')).toContainText('> DVD');
  await expect(page.locator('.secret-terminal')).not.toHaveClass(/secret-terminal--active/);
});

test('a wrong answer closes the terminal', async ({ page }) => {
  await page.goto('./');
  await typeSecretWord(page);
  await page.locator('.secret-terminal__input').fill('42');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  await expect(page.locator('.secret-terminal')).not.toHaveClass(/secret-terminal--active/);
});

test('Escape closes the terminal', async ({ page }) => {
  await page.goto('./');
  await typeSecretWord(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await expect(page.locator('.secret-terminal')).not.toHaveClass(/secret-terminal--active/);
});
