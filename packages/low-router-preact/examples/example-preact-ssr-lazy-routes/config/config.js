import { resolve } from "path"

export default {
  srcDir: resolve("src"),

  // public assets from this folder will be copied in build folder
  publicDir: resolve("src/public"),

  // outDir: where files are built
  // If this value is change, add this new path in .gitignore
  outDir: resolve("dist"),
  outDirSsrScripts: resolve("dist/ssr/scripts"),
  outDirSsrServer: resolve("dist/ssr/server"),
  outDirSsrClient: resolve("dist/ssr/client"),
  outDirSpa: resolve("dist/spa"),
  outDirStaticClient: resolve("dist/static/client"),
  outDirStaticScripts: resolve("dist/static/scripts"),
}
