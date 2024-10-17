// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/', // หรือไม่ต้องตั้งค่า base ก็ได้
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
});