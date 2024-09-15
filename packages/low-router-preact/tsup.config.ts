import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: {
      "low-router-preact": "src/index.ts",
    },
    splitting: true,
    clean: true,
    dts: true,
    format: ["esm"],
    minify: true,
    external: [
      "preact",
      "preact/compat",
      "preact/hooks",
      "@wbe/utils",
      "@wbe/debug",
      "@wbe/low-router",
      // /preact-deps/,
    ],
  },
])
