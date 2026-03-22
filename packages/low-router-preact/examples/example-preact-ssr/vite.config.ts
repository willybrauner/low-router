import autoprefixer from "autoprefixer"
import { ConfigEnv, defineConfig, loadEnv, UserConfig } from "vite"
import { resolve } from "path"
import config from "./config/config.js"
import preact from "@preact/preset-vite"
import checker from "vite-plugin-checker"
import { viteMaestroCustomLogger } from "./config/vite-plugins/vite-custom-logger"
import portFinderSync from "portfinder-sync"

/**
 * Vite config
 */
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  const isDevelopment = mode === "development"
  const loadEnvVars = loadEnv(mode, process.cwd(), "")
  const protocol: "http" | "https" = (loadEnvVars.PROTOCOL as "http" | "https") ?? "http"

  // Merge "process.env" vars AFTER loadEnvVars!
  // In some case, process.env vars are loaded via external service like gitlab-ci
  // and must overwrite .env vars loaded by loadEnv()
  process.env = {
    ...loadEnvVars,
    ...process.env,
    PORT: `${portFinderSync.getPort(5186)}`,
    HOST: "localhost",
    PROTOCOL: protocol,
  }

  return {
    ...(isDevelopment
      ? {
          customLogger: viteMaestroCustomLogger({
            protocol,
            host: process.env.HOST,
            port: process.env.PORT,
            base: process.env.VITE_APP_BASE,
          }),
        }
      : {}),

    define: {
      "process.env.VITE_APP_BASE": JSON.stringify(process.env.VITE_APP_BASE),
    },
    // "base" refer to folder where assets are served
    base: process.env.VITE_APP_BASE,

    // public folder content is copied in static build folder
    publicDir: config.publicDir,

    css: {
      modules: {
        generateScopedName: "[name]__[local]__[hash:base64:5]",
      },
      postcss: {
        plugins: [autoprefixer()],
      },
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },

    build: {
      assetsDir: "./",
      write: true,
      outDir: config.outDir,
      emptyOutDir: true,
      manifest: true,
      assetsInlineLimit: 0,
    },

    resolve: {
      alias: {
        "~": resolve(__dirname),
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
