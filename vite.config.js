import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // In local dev (npm run dev), forward /api calls to the backend
    proxy: { "/api": "http://localhost:5000" },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.js",
  },
});
