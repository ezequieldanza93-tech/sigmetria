import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sigmetria.com.ar',
  integrations: [sitemap()],
});
