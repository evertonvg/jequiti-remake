import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4321/',
    headless: !!process.env.CI,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321/',
    reuseExistingServer: !process.env.CI,
  },
});
