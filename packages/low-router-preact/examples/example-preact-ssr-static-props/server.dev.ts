import fastify from "fastify"
import fastifyMiddie from "@fastify/middie"
import { createServer } from "vite"
import { renderToStringAsync } from "preact-render-to-string"
import portFinderSync from "portfinder-sync"
import chalk from "chalk"
import path from "path"

const BASE = "/"
const PORT = portFinderSync.getPort(5184)
const INDEX_SERVER_PATH = path.resolve("src/index-server.tsx")
const DEV_SCRIPTS = {
  js: [{ tag: "script", attr: { type: "module", src: "/src/index-client.tsx" } }],
}

async function server() {
  const app = fastify()

  const vite = await createServer({
    base: BASE,
    appType: "custom",
    logLevel: "info",
    server: { middlewareMode: true, cors: false, hmr: { port: 24684 } },
  })

  // Handle vite dev-server script HMR & filter requests
  await app.register(fastifyMiddie)
  app.use(vite.middlewares)

  app.route({
    method: "GET",
    url: "*",
    handler: async (req, reply) => {
      const accept = req.headers.accept || ""
      if (!accept.includes("text/html")) return

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
          `GET ${req.originalUrl}`,
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

    console.log("Server is running at: " + chalk.cyan(`http://localhost:${PORT}${BASE}`))
  }),
)
