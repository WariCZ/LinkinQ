import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// import { viteStaticCopy } from 'vite-plugin-static-copy';
// import svgr from 'vite-plugin-svgr';

const { PORT = 3001 } = process.env;

// https://vitejs.dev/config/
// export default defineConfig({
//   root: "./src/client/",
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src/client"),
//       stream: "stream-browserify",
//     },
//   },
//   plugins: [
//     react(),
//     // viteStaticCopy({
//     //   targets: [
//     //     {
//     //       src: 'config.js',
//     //       dest: './',
//     //     },
//     //   ],
//     // }),
//     // svgr(),
//   ],
//   server: {
//     proxy: {
//       "/api": {
//         target: `http://localhost:${PORT}`,
//         changeOrigin: true,
//       },
//     },
//   },
//   build: {
//     outDir: "dist/app",
//   },
// });

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
