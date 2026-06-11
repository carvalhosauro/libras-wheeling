import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  // GitHub Pages serve em https://carvalhosauro.github.io/libras-wheeling/
  base: "/libras-wheeling/",
  test: {
    // testes cobrem apenas módulos puros (geometry, random, items) — sem DOM
    environment: "node",
  },
});
