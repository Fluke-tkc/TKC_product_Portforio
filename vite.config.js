// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/', // หรือ '/TKC_product_Portforio/' ถ้าใช้ GitHub Pages
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
});