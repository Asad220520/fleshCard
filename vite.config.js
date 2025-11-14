// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ✅ Только это для Tailwind
  ],
  // ❌ Убедитесь, что здесь НЕТ ручных настроек PostCSS
});
