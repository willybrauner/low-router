import chalk from "chalk"
import fastify from "fastify"
import fastifyMiddie from "@fastify/middie"
import fs from "node:fs/promises"
import { loadEnv } from "vite"
import portFinderSync from "portfinder-sync"
import { renderToStringAsync } from "preact-render-to-string"
import config from "./config/config"

const BASE = "/"
const PORT = portFinderSync.getPort(5173)
const MANIFEST_PARSER_PATH = `${config.outDirSsrScripts}/ManifestParser.js`
const VITE_MANIFEST_PATH = `${config.outDirSsrClient}/.vite/manifest.json`
const INDEX_SERVER_PATH = `${config.outDirSsrServer}/index-server.js`

async function server() {
  const app = fastify()
  await app.register(fastifyMiddie)

  const compression = (await import("compression")).default
  const sirv = (await import("sirv")).default
  app.use(compression())
  app.use(BASE, sirv(config.outDirSsrClient, { extensions: [] }))

  app.route({
    method: "GET",
    url: "*",
    onResponse: () => {
      // need to be set to make elapsed time available in handler callback
    },
    handler: async (req, reply) => {
      try {
        // Prepare scripts to inject in template
        const { ManifestParser } = await import(MANIFEST_PARSER_PATH)
        const manifest = await fs.readFile(VITE_MANIFEST_PATH, "utf-8")
        const scriptTags = ManifestParser.getScriptTagFromManifest(manifest, BASE)

        // Prepare & stream the DOM
        const { render } = await import(INDEX_SERVER_PATH)
        const dom = await render(req.originalUrl, scriptTags, false, BASE)
        const html = await renderToStringAsync(dom)

        // send response
        reply.status(200)
        reply.header("Content-Type", "text/html; charset=utf-8")
        reply.send("<!DOCTYPE html>" + html)
        console.log(
          chalk.white(`GET ${req.originalUrl}`),
          chalk.green(reply.statusCode),
          `in ${Math.round(reply.elapsedTime)}ms`,
        )
      } catch (e) {
        reply.log.error(e)
        reply.status(500)
        reply.send(e.stack)
      }
    },
  })

  return app
}

server().then((app) =>
  app.listen({ port: PORT }, () => {
    console.log(
      `⚡️ ${chalk.white("server.prod is running in")} ${chalk.cyan(`http://localhost:${PORT}`)}`,
    )
  }),
)
