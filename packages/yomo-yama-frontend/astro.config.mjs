import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.URL || 'https://yama.4dir.com/',
  output: 'static',
  build: {
    format: 'file',
  },
  integrations: [sitemap()],
});
