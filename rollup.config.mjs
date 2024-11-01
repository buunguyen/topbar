import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";

const config = [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [typescript()],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [typescript({ importHelpers: false })],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
  {
    input: "src/index.ts",
    output: [{ file: "index.d.ts", format: "es" }],
    plugins: [dts()],
  },
  {
    input: "src/index.ts",
    output: {
      name: "topbar",
      file: "topbar.js",
      format: "iife",
    },
    plugins: [typescript({ outDir: "." })],
  },
  {
    input: "src/index.ts",
    output: {
      name: "topbar",
      file: "topbar.min.js",
      format: "iife",
    },
    plugins: [typescript({ outDir: "." }), terser()],
  },
];

export default config;
