import { defineConfig } from "tsup"
export default defineConfig([
  // {
  //   entry: {
  //     deps: "src/deps.ts",
  //   },
  //   splitting: true,
  //   clean: true,
  //   dts: true,
  //   format: ["esm"],
  //   minify: true,
  //   // external: ["preact", "preact/hooks", "preact/compat"],
  // },
  {
    entry: {
      "low-router-preact": "src/index.ts",
    },
    splitting: true,
    clean: true,
    dts: true,
    format: ["esm"],
    minify: true,
    //    outDir: "dist/low-router-preact",

    external: [
      // "preact",
      // "preact/hooks",
      // "react",
      // "react-dom",
      "@wbe/utils",
      "@wbe/debug",
      "@wbe/low-router",
    ], // Mark dependencies as external
  },
])
