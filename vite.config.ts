import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

function offlinePrecache(): Plugin {
  return {
    name: "fun-hut-offline-precache",
    apply: "build",
    generateBundle(options, bundle) {
      const outputDir = options.dir?.replace(/\\/g, "/");
      if (!outputDir?.endsWith("/client")) return;

      const assets = Object.keys(bundle)
        .filter((fileName) => /\.(js|css|woff2?|ttf|svg|png|jpe?g|webp)$/.test(fileName))
        .map((fileName) => `/${fileName}`);
      assets.push("/manifest.webmanifest", "/favicon.svg", "/apple-touch-icon.png", "/icon-192.png", "/icon-512.png");
      this.emitFile({ type: "asset", fileName: "precache.json", source: JSON.stringify([...new Set(assets)]) });
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), offlinePrecache(), tsconfigPaths(), tanstackStart(), react()],
  server: {
    port: 3000,
  },
});
