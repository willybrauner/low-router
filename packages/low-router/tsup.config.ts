import { defineConfig } from "tsup"
import { spawn } from "child_process"

export default defineConfig({
  entry: { "low-router": "src/index.ts" },
  splitting: true,
  clean: true,
  dts: true,
  format: ["esm"],
  external: ["@wbe/debug"],
  name: "low-router",
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
