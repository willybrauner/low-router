import { defineConfig } from "tsup"
// @ts-ignore
import { spawn } from "child_process"

export default defineConfig({
  entry: { "low-router-preact": "src/index.ts" },
  splitting: true,
  clean: true,
  dts: true,
  format: ["esm"],
  minify: true,
  external: [
    "preact",
    "preact/hooks",
    "preact/compat",
    "@wbe/utils",
    "@wbe/debug",
    "@wbe/low-router",
  ],
  async onSuccess() {
    const process = spawn("npx", ["size-limit"], { shell: true })
    process.stdout.on("data", (data) => console.log(data.toString()))
  },
})
