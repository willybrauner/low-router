import { defineConfig } from "tsup"
// import fs from "node:fs/promises"

export default defineConfig([
  // {
  //   entry: {
  //     "preact-deps": "src/preact-deps.ts",
  //   },
  //   splitting: true,
  //   clean: true,
  //   dts: true,
  //   format: ["esm"],
  //   minify: true,
  //   external: ["preact", "preact/hooks", "preact/compat"],
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
    external: [
      "preact",
      "preact/compat",
      "preact/hooks",
      "@wbe/utils",
      "@wbe/debug",
      "@wbe/low-router",
      // /preact-deps/,
    ],

    // esbuildPlugins: [
    //   {
    //     name: "replace-import",
    //     setup(build) {
    //       build.onLoad({ filter: /\.ts$/ }, async (args) => {
    //         let contents = await fs.readFile(args.path, "utf8")
    //         contents = contents.replace(/from\s+['"]\.\.\/preact-deps['"]/g, 'from "./preact-deps"')
    //         return {
    //           contents,
    //           loader: "default",
    //         }
    //       })
    //     },
    //   },
    // ],
  },
])
