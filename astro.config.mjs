// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // Deployed to Cloudflare Pages at the root of the project's domain.
  // Update `site` to match your actual Pages project name / custom domain.
  site: 'https://appointment-orchestration.pages.dev',

  base: '/',
  output: "hybrid",
  adapter: cloudflare()
});