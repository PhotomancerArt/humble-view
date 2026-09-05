import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Two composition roots, two HTML entries. `index.html` talks to apps/api over the network;
// `index.browser.html` runs the backend routes in the browser (what GitHub Pages serves).
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: { index: "index.html", browser: "index.browser.html" },
    },
  },
  test: {
    environment: "jsdom",
  },
});
