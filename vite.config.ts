import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  // GitHub Pages serve em https://carvalhosauro.github.io/libras-wheeling/
  base: "/libras-wheeling/",
});
