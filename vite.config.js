import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  const isVercelPreview = process.env.VERCEL_ENV === "preview";
  const enablePWA = !isVercelPreview;

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),

      enablePWA
        ? VitePWA({
            registerType: "autoUpdate",
            injectRegister: false,
            includeAssets: [
              "favicon-brand.ico",
              "favicon-brand-96x96.png",
              "favicon.svg",
              "apple-touch-icon-brand.png",
              "favicon.ico",
              "site.webmanifest",
            ],

            manifest: {
              name: "Khoaluan Music Platform",
              short_name: "Khoaluan",
              description: "Music streaming platform",
              start_url: "/",
              display: "standalone",
              orientation: "portrait",
              background_color: "#050705",
              theme_color: "#050705",

              icons: [
                {
                  src: "/web-app-manifest-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                  purpose: "maskable",
                },
                {
                  src: "/web-app-manifest-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "maskable",
                },
              ],
            },

            workbox: {
              globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
              navigateFallbackDenylist: [
                /\/[^/?]+\.[^/]+(?:\?.*)?$/,
                /^\/registerSW\.js$/,
                /^\/sw\.js$/,
                /^\/workbox-.*\.js$/,
              ],
            },
          })
        : null,
    ].filter(Boolean),
    server: {
      proxy: {
        "/__firebase-storage-proxy": {
          target: "https://firebasestorage.googleapis.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__firebase-storage-proxy/, ""),
        },
      },
    },
    preview: {
      proxy: {
        "/__firebase-storage-proxy": {
          target: "https://firebasestorage.googleapis.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__firebase-storage-proxy/, ""),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          onlyExplicitManualChunks: true,
          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            if (
              id.includes("echarts-for-react") ||
              id.includes("echarts") ||
              id.includes("zrender")
            ) {
              return "charts";
            }

            if (id.includes("firebase")) {
              return "firebase";
            }

            if (id.includes("framer-motion")) {
              return "motion";
            }

            if (id.includes("react-icons")) {
              return "icons";
            }

            if (id.includes("axios") || id.includes("zustand")) {
              return "core";
            }

            return "vendor";
          },
        },
      },
    },
  };
});
