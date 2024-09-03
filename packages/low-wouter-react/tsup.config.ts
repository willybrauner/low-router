import { defineConfig } from "tsup"
// @ts-ignore
import fs from "node:fs/promises"

// -------------------------

export default defineConfig([
  {
    entry: {
      deps: "src/deps.ts",
    },
    splitting: true,
    clean: true,
    dts: true,
    format: ["esm"],
    minify: true,
    external: ["react"],
  },
  {
    entry: {
      // "low-router-react": "./node_modules/@wbe/low-router-preact/src/index.ts",
      "low-router-react": "src/index.ts",
    },
    splitting: true,
    clean: true,
    dts: true,
    format: ["esm"],
    minify: true,

    external: [
      /deps/,
      "preact",
      "preact/hooks",
      "preact/compat",
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
            contents = contents.replace(/from\s+['"]\.\.\/deps['"]/g, 'from "./deps"')
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
