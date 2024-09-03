import { defineConfig } from "tsup"
// @ts-ignore
import fs from "node:fs/promises"

export default defineConfig([
  {
    entry: {
      "preact-deps": "src/preact-deps.ts",
    },
    splitting: true,
    clean: true,
    dts: true,
    format: ["esm"],
    minify: true,
    external: ["preact", "preact/hooks", "preact/compat"],
  },
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
      /preact-deps/,
      "preact",
      "preact/hooks",
      "@wbe/utils",
      "@wbe/debug",
      "@wbe/low-router",
    ],

    esbuildPlugins: [
      {
        name: "replace-import",
        setup(build) {
          build.onLoad({ filter: /\.ts$/ }, async (args) => {
            let contents = await fs.readFile(args.path, "utf8")
            // Replace `from "../deps"` with `from "./deps"`
            contents = contents.replace(/from\s+['"]\.\.\/preact-deps['"]/g, 'from "./preact-deps"')
            return {
              contents,
              loader: "default",
            }
          })
        },
      },
    ],
  },
])
