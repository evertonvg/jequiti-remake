import { test, expect } from './fixtures';

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

async function pressSequence(page: import('@playwright/test').Page, codes: string[], delay = 20) {
  for (const code of codes) {
    await page.keyboard.press(code);
    await page.waitForTimeout(delay);
  }
}

test.describe('Konami code', () => {
  test('normal mode plays the Ronaldinho video', async ({ page }) => {
    await page.goto('./');
    await pressSequence(page, KONAMI);
    await page.waitForTimeout(300);
    await expect(page.locator('#hypnosisEasterEgg')).toHaveAttribute('src', /ronaldinhosoccer\.mp4$/);
  });

  test('horror mode plays Illuminati with the red filter', async ({ page }) => {
    await page.goto('./');
    await page.locator('#hypnosisBall').click({ force: true });
    await page.waitForTimeout(400);
    await pressSequence(page, KONAMI);
    await page.waitForTimeout(300);
    await expect(page.locator('#hypnosisEasterEgg')).toHaveAttribute('src', /illuminatti\.mp4$/);
    await expect(page.locator('#hypnosisEasterEggFilter')).toHaveClass(/hypnosis__easter-egg-filter--active/);
  });

  test('angelical mode plays jesus-come and pauses/resumes the angelical audio', async ({ page }) => {
    await page.goto('./');
    await page.locator('#hypnosisBall').dblclick({ force: true });
    await page.waitForTimeout(200);
    expect(await page.locator('#hypnosisAngelicalAudio').evaluate((el: HTMLAudioElement) => el.paused)).toBe(false);

    await pressSequence(page, KONAMI);
    await page.waitForTimeout(200);
    await expect(page.locator('#hypnosisEasterEgg')).toHaveAttribute('src', /jesus-come\.mp4$/);
    expect(await page.locator('#hypnosisAngelicalAudio').evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);

    await page.locator('#hypnosisEasterEgg').evaluate((el: HTMLVideoElement) => {
      el.currentTime = el.duration || 0;
      el.dispatchEvent(new Event('ended'));
    });
    await page.waitForTimeout(200);
    expect(await page.locator('#hypnosisAngelicalAudio').evaluate((el: HTMLAudioElement) => el.paused)).toBe(false);
  });
});

test.describe('key-mash (20+ keys in under 5s)', () => {
  test('angelical mode blacks out then plays jesus-jumpscare', async ({ page }) => {
    await page.goto('./');
    await page.locator('#hypnosisBall').dblclick({ force: true });
    await page.waitForTimeout(200);

    for (let i = 0; i < 25; i++) {
      await page.keyboard.press('KeyQ');
    }
    // 2s CSS blackout transition + video start
    await page.waitForTimeout(2500);

    await expect(page.locator('#hypnosisEasterEgg')).toHaveAttribute('src', /jesus-jumpscare\.mp4$/);
  });
});
