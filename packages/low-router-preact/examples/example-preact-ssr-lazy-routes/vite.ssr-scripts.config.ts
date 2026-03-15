// @ts-ignore
import autoprefixer from "autoprefixer"
import { resolve } from "path"
import { defineConfig } from "vite"
import config from "./config/config.js"
import debug from "@wbe/debug"
const log = debug("config:vite.config")

export default defineConfig(({ command, mode }) => {
  return {
    base: process.env.VITE_APP_BASE,

    build: {
      assetsDir: "./",
      write: true,
      outDir: config.outDirSsrScripts,
      emptyOutDir: true,
      manifest: false,
      assetsInlineLimit: 0,
      ssr: true,
      define: {
        "process.env.VITE_APP_BASE": JSON.stringify(process.env.VITE_APP_BASE)
      },
      rollupOptions: {
        input: [
          resolve("server.prod.ts"),
          resolve("src/core/server-utils/ManifestParser.ts")
        ],
        output: {
          manualChunks: undefined,
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`
        }
      }
    },
    css: {
      modules: {
        generateScopedName: "[name]__[local]__[hash:base64:5]"
      },
      postcss: {
        plugins: [autoprefixer()]
      }
    },
    resolve: {
      alias: {
        "~": resolve(__dirname, "src")
      }
    }
  }
})
