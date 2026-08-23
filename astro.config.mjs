// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  },
  // Ensure 'site' is set to your final domain for correct sitemaps/canonical tags
  site: 'https://siteoftools.com',
  // Standard output is 'static', but being explicit is good practice
  output: 'static'
});