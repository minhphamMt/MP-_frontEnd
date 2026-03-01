import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic", // đảm bảo không lỗi React is not defined
    }),

    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      manifest: {
        name: "Khoaluan Music Platform",
        short_name: "Khoaluan",
        description: "Music streaming platform",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#000000",
        theme_color: "#000000",

        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
});