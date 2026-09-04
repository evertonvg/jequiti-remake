import { test, expect } from './fixtures';

test('flash cycle picks images from the theme-appropriate pool (angelical -> heaven)', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await page.locator('#hypnosisBall').dblclick({ force: true });
  await page.waitForTimeout(200);

  const seen = new Set<string>();
  for (let i = 0; i < 15; i++) {
    await page.clock.fastForward(30000);
    await page.waitForTimeout(50);
    const src = await page.locator('#hypnosisFlashImage').getAttribute('src');
    if (src) seen.add(src.split('/').pop() ?? '');
  }

  const heavenNames = ['4d2284a7de8184b18e7287cbeb07b7ac.jpg', 'Confused-jesus-meme-4.jpg', 'ecce-mono-jesus-ReproducaoInstagram.jpg.webp', 'images.jpg', 'jesus-watcha-doin-meme-xqbc6.jpg'];
  expect([...seen].some((name) => heavenNames.includes(name))).toBe(true);
});

test('idle timeout (42s) shows the DVD screensaver and dismisses on keypress', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await page.clock.fastForward(43000);
  await page.waitForTimeout(200);
  await expect(page.locator('#hypnosisIdle')).toHaveClass(/hypnosis__idle--active/);

  await page.keyboard.press('Space');
  await page.waitForTimeout(200);
  await expect(page.locator('#hypnosisIdle')).not.toHaveClass(/hypnosis__idle--active/);
});
