import path from "path";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import copy from "rollup-plugin-copy";

const packageJson = require("./package.json");

export default [
  // Server build
  {
    input: "src/server/index.ts",
    output: {
      dir: "dist/server",
      format: "esm",
      sourcemap: true,
    },
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      copy({
        targets: [
          { src: "src/server/**/*.css", dest: "dist/server" },
          { src: "src/server/**/*.png", dest: "dist/server" },
        ],
        verbose: true,
        hook: "writeBundle",
      }),
    ],
  },

  // Client build
  {
    input: "src/client/index.tsx",
    output: {
      dir: "dist/client",
      format: "esm",
      sourcemap: true,
    },
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
      }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      copy({
        targets: [
          { src: "src/client/**/*.css", dest: "dist/client" },
          { src: "src/client/**/*.png", dest: "dist/client" },
        ],
        verbose: true,
        hook: "writeBundle",
      }),
    ],
  },

  // Whole src build (optional, pokud chceš celý src exportovat)
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      copy({
        targets: [
          { src: "src/**/*.css", dest: "dist" },
          { src: "src/**/*.png", dest: "dist" },
        ],
        verbose: true,
        hook: "writeBundle",
      }),
    ],
  },
];
