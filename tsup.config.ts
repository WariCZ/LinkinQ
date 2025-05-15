import { defineConfig } from "tsup";

// export default defineConfig({
//   entry: {
//     client: "src/client/index.tsx",
//     server: "src/server/index.ts",
//   },
//   format: ["esm", "cjs"],
//   dts: true,
//   sourcemap: true,
//   clean: true,
//   outDir: "dist",
//   external: ["react", "react-dom", "pug"], // peerDependencies nebalit
//   esbuildOptions(options) {
//     // pokud chceš nějaké specifické esbuild nastavení
//   },
// });

export default defineConfig({
  entry: ["src/client/index.tsx", "src/server/index.ts", "src/lib/**/*.ts"],
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  dts: true,
  outDir: "dist",
  treeshake: false,
  clean: true,
  minify: false,
  external: ["pug"], // peerDependencies nebalit
  shims: false, // pokud potřebuješ Node shims, můžeš změnit na true
});
