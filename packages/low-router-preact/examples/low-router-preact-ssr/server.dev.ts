import fastify from "fastify"
import fastifyMiddie from "@fastify/middie"
import { createServer, loadEnv } from "vite"
import { renderToStringAsync } from "preact-render-to-string"
import portFinderSync from "portfinder-sync"
import chalk from "chalk"
import config from "./config/config"

const vars = loadEnv(process.env.NODE_ENV, process.cwd(), "")
const BASE = vars.VITE_APP_BASE || process.env.VITE_APP_BASE || "/"
const PORT = process.env.DOCKER_NODE_PORT ?? portFinderSync.getPort(5173)
const INDEX_SERVER_PATH = `${config.srcDir}/index-server.tsx`
const DEV_SCRIPTS = {
  js: [{ tag: "script", attr: { type: "module", src: "/src/index-client.tsx" } }],
}

async function server() {
  const app = fastify()

  const vite = await createServer({
    base: BASE,
    appType: "custom",
    logLevel: "info",
    server: { middlewareMode: true, cors: false },
  })

  // Handle vite dev-server script HMR & filter requests
  await app.register(fastifyMiddie)
  app.use(vite.middlewares)

  app.route({
    method: "GET",
    url: "*",
    onResponse: () => {
      // need to be set to make elapsed time available in handler callback
    },
    handler: async (req, reply) => {
      if (req.url === "/favicon.ico") return

      try {
        // Transforms the ESM source code to be usable in Node.js
        const { render } = await vite.ssrLoadModule(INDEX_SERVER_PATH)
        // Get react-dom from the render method
        const dom = await render(req.originalUrl, DEV_SCRIPTS, false, BASE)
        // render the string app
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
        vite.ssrFixStacktrace(e)
        reply.log.error(e)
        reply.status(500)
        console.error(e)
      }
    },
  })

  return app
}

server().then((app) =>
  app.listen({ port: PORT }, (err) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
  }),
)
