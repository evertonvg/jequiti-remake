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

test('answering "DVD" unlocks dragging the ball, without triggering a theme toggle', async ({ page }) => {
  await page.goto('./');
  await typeSecretWord(page);
  await page.locator('.secret-terminal__input').fill('DVD');
  await page.keyboard.press('Enter');

  const ball = page.locator('#hypnosisBall');
  await expect(ball).toHaveClass(/hypnosis__ball--draggable/);

  // The ball spins continuously and now covers the full viewport, so its
  // getBoundingClientRect() swings wildly with the rotation angle — read the
  // translate() the drag logic writes into style.transform instead.
  await page.mouse.move(640, 360);
  await page.mouse.down();
  await page.mouse.move(790, 460, { steps: 10 });
  await page.mouse.up();

  const translate = await ball.evaluate((el) => {
    const match = (el as HTMLElement).style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);
    return match ? { x: parseFloat(match[1]), y: parseFloat(match[2]) } : null;
  });
  expect(translate?.x).toBeCloseTo(150, 0);
  expect(translate?.y).toBeCloseTo(100, 0);

  await page.waitForTimeout(400);
  await expect(page.locator('#hypnosisAudio')).toHaveJSProperty('paused', true);
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
