import { defineConfig } from "tsup"
// @ts-ignore
import fs from "node:fs/promises"
// @ts-ignore
import { createRequire } from "module"
const require = createRequire(import.meta.url)
import alias from "esbuild-plugin-alias"

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
    },
    splitting: false,
    clean: true,
    dts: true,
    format: ["esm"],
    minify: true,

    external: ["react", /react-deps/],
    esbuildPlugins: [
      // {
      //   name: "replace-preact-with-react",
      //   setup(build) {
      //     build.onLoad({ filter: /\.ts$/ }, async (args) => {
      //       let contents = await fs.readFile(args.path, "utf8")
      //
      //       // Replace Preact imports with React imports
      //       contents = contents
      //         .replace(/from\s+['"]preact['"]/g, 'from "react"')
      //         .replace(/from\s+['"]preact\/hooks['"]/g, 'from "react"')
      //         .replace(/from\s+['"]preact\/compat['"]/g, 'from "react"')
      //         // .replace(
      //         //   /import\s+{(.+)}\s+from\s+['"]\.\/preact-deps['"]/g,
      //         //   'import {$1} from "./react-deps"'
      //         // )
      //       return {
      //         contents,
      //         loader: "ts",
      //       }
      //     })
      //   },
      // },
      // alias({
      //   preact: require.resolve("react"),
      //   "preact/compat": require.resolve("react"),
      //   "preact/hooks": require.resolve("react"),
      // }),
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
