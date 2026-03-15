import App from "~/src/components/App/App"
import { ScriptsTags } from "~/src/core/server-utils/ScriptsTags"
import { RawScript } from "~/src/core/server-utils/RawScript"
import { routes } from "~/src/routes"
import { LowRouter, normalizePath } from "@wbe/low-router"
import { Router } from "@wbe/low-router-preact"
import debug from "@wbe/debug"

const log = debug("low-router-preact:index-server")

export async function render(
  staticLocation: string,
  scripts,
  isPrerender = false,
  base: string,
): Promise<any> {
  staticLocation = normalizePath(`${isPrerender ? base : ""}${staticLocation}`)
  log("staticLocation:", staticLocation)

  const router = new LowRouter(routes, { base, id: 1 })

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="IE=Edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title>app</title>
        <ScriptsTags scripts={scripts.css} />
        <ScriptsTags scripts={scripts.woff2} />
      </head>
      <body>
        <div id="root">
          <Router router={router} staticLocation={staticLocation}>
            <App />
          </Router>
        </div>
        <ScriptsTags scripts={scripts.js} />
        <RawScript name={"__INITIAL_STATIC_PROPS__"} data={{}} />
        <RawScript name={"__GLOBAL_DATA__"} data={{}} />
      </body>
    </html>
  )
}
