import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // INDISPENSABLE pour le multi-tenant
  output: "server",

  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
  },
});