import { defineConfig, UserConfig } from "vite"
import preact from "@preact/preset-vite"
import checker from "vite-plugin-checker"

export default defineConfig((): UserConfig => {
  return {
    base: "/",
    resolve: {
      alias: {
        "~": "/",
        react: "preact/compat",
        "react-dom": "preact/compat",
      },
    },

    plugins: [
      preact(),
      checker({
        typescript: true,
        enableBuild: true,
        overlay: true,
        terminal: true,
      }),
    ],
  }
})
