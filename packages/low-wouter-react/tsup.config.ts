import { defineConfig } from "tsup"
// @ts-ignore
import fs from "node:fs/promises"
// @ts-ignore
import { createRequire } from "module"
const require = createRequire(import.meta.url)

export default defineConfig([
  {
    entry: {
      "react-deps": "src/react-deps.ts",
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
      "low-router-react": require.resolve("@wbe/low-router-preact/src/index.ts"),
//      "low-router-react": "../low-router-preact/src/index.ts",
    },
    splitting: false,
    clean: true,
    dts: true,
    format: ["esm"],
    minify: true,
    external: ["react", /react-deps/],
    esbuildPlugins: [
      {
        name: "replace-import",
        setup(build) {
          build.onLoad({ filter: /\.ts$/ }, async (args) => {
            let contents = await fs.readFile(args.path, "utf8")
            contents = contents.replace(/from\s+['"]\.\.\/preact-deps['"]/g, 'from "./react-deps"')
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
