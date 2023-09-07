import { defineConfig } from "tsup"
import { spawn } from "child_process"

export default defineConfig({
  entry: { lowrouter: "src/index.ts" },
  splitting: false,
  clean: true,
  dts: true,
  format: ["esm"],
  external: ["@wbe/debug"],
  name: "lowrouter",
  minify: true,
  // terserOptions: {
  //   compress: true,
  //   mangle: {
  //     properties: {
  //       regex: /^(#.+)$/,
  //     },
  //   },
  // },
  async onSuccess() {
    const process = spawn("npx", ["size-limit"], { shell: true })
    process.stdout.on("data", (data) => console.log(data.toString()))
  },
})
