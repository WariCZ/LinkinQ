import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "./src/client/",
  server: {
    watch: {
      ignored: ["./src/server/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/client"),
      stream: "stream-browserify",
    },
  },
  plugins: [react()],
});
