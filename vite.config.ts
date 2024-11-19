import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "./src/client/",
  build: {
    outDir: "../../dist",
    emptyOutDir: true, // also necessary
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    target: "esnext", // Rychlejší build pro moderní prohlížeče
    minify: "esbuild", // Použití esbuild místo Terseru pro minifikaci
  },
  server: {
    watch: {
      ignored: ["./src/server/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      stream: "stream-browserify",
    },
  },
  plugins: [react()],
});
