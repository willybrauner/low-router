import App from "~/components/App/App"
import { ScriptsTags } from "~/core/server-utils/ScriptsTags"
import { RawScript } from "~/core/server-utils/RawScript"
import { locales, routes, defaultLocaleInUrl } from "~/routes"
import { LowRouter, normalizePath } from "@wbe/low-router"
import { getStaticPropsFromUrl, I18n, Router } from "@wbe/low-router-preact"
import debug from "@wbe/debug"

const log = debug("low-router-preact:index-server")

/**
 * Server render
 * @param staticLocation URL to render
 * @param isPrerender
 * @param scripts
 * @param base
 */
export async function render(
  staticLocation: string,
  scripts,
  isPrerender = false,
  base: string,
): Promise<any> {
  // prepare base & URL, remove trailing slashes
  staticLocation = normalizePath(`${isPrerender ? base : ""}${staticLocation}`)
  log("staticLocation:", staticLocation)

  // Init router
  const i18n = new I18n(locales, { base, defaultLocaleInUrl, staticLocation })
  const router = new LowRouter(i18n.addLocaleParamToRoutes(routes), { base, id: 1 })

  // Request initial static props
  const initialStaticProps = await getStaticPropsFromUrl(staticLocation, router, i18n)
  log("initialStaticProps", initialStaticProps)

  // Current route props
  const props = initialStaticProps && Object.values(initialStaticProps)?.[0]
  log("props", props)

  return (
    <html lang={i18n.currentLocale.code}>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="IE=Edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title>{props?.title || "app"}</title>
        <meta name="description" content={props?.description || ""} />
        <link rel="icon" type="image/png" sizes="32x32" href={"#"} />
        <ScriptsTags scripts={scripts.css} />
        <ScriptsTags scripts={scripts.woff2} />
      </head>
      <body>
        <div id="root">
          <Router
            i18n={i18n}
            router={router}
            staticLocation={staticLocation}
            initialStaticProps={initialStaticProps}
          >
            <App />
          </Router>
        </div>
        <ScriptsTags scripts={scripts.js} />
        <RawScript name={"__INITIAL_STATIC_PROPS__"} data={initialStaticProps} />
        <RawScript name={"__GLOBAL_DATA__"} data={{}} />
      </body>
    </html>
  )
}
