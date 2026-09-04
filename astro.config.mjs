import { defineConfig } from 'astro/config';
import alpine from '@astrojs/alpinejs';

// GitHub Pages serves this repo under /jequiti-remake/, so only the CI build
// (which deploys there) needs that base path. Locally it stays at the root —
// no sub-path to juggle in dev, tests or manual builds.
const base = process.env.CI ? '/jequiti-remake' : '/';

export default defineConfig({
  site: 'https://evertonvg.github.io',
  base,
  integrations: [alpine()],
});
