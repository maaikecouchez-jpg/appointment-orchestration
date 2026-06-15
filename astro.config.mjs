// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Deployed to Cloudflare Workers (static assets) at the root of the domain.
  site: 'https://appointment-orchestration.stijn-504.workers.dev',
  base: '/',
});
