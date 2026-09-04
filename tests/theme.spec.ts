import { test, expect } from './fixtures';

test.describe('theme toggle', () => {
  test('baseline: ball spins with no theme active', async ({ page }) => {
    await page.goto('./');
    const transform1 = await page.locator('#hypnosisBall').evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(300);
    const transform2 = await page.locator('#hypnosisBall').evaluate((el) => getComputedStyle(el).transform);
    expect(transform1).not.toBe(transform2);

    const overlayOpacity = await page.locator('#hypnosisOverlay').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(overlayOpacity).toBe(0);
  });

  test('single click toggles horror theme (red overlay + siren)', async ({ page }) => {
    await page.goto('./');
    await page.locator('#hypnosisBall').click({ force: true });
    await page.waitForTimeout(400); // past the double-click window
    await page.waitForTimeout(1000);

    const overlayOpacity = await page.locator('#hypnosisOverlay').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(overlayOpacity).toBeGreaterThan(0);
    const sirenPaused = await page.locator('#hypnosisAudio').evaluate((el: HTMLAudioElement) => el.paused);
    expect(sirenPaused).toBe(false);
  });

  test('double click toggles angelical theme and excludes horror', async ({ page }) => {
    await page.goto('./');
    await page.locator('#hypnosisBall').dblclick({ force: true });
    await page.waitForTimeout(1000);

    const angelicalOpacity = await page.locator('#hypnosisAngelicalOverlay').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(angelicalOpacity).toBeGreaterThan(0);
    const overlayOpacity = await page.locator('#hypnosisOverlay').evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(overlayOpacity).toBe(0);
    const angelicalAudioPaused = await page.locator('#hypnosisAngelicalAudio').evaluate((el: HTMLAudioElement) => el.paused);
    expect(angelicalAudioPaused).toBe(false);
  });
});
