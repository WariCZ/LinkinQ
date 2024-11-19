import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "./src/client/",
  build: {
    outDir: "../../dist",
    emptyOutDir: true, // also necessary
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
