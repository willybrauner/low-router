import App from "~/src/App"
import { locales, routes, defaultLocaleInUrl } from "~/src/routes"
import { LowRouter, normalizePath } from "@wbe/low-router"
import { getStaticPropsFromUrl, I18n, Router } from "@wbe/low-router-preact"

export async function render(
  staticLocation: string,
  scripts,
  isPrerender = false,
  base: string,
): Promise<any> {
  // prepare base & URL, remove trailing slashes
  staticLocation = normalizePath(`${isPrerender ? base || "/" : ""}${staticLocation}`)
  // Init router
  const i18n = new I18n(locales, { base, defaultLocaleInUrl, staticLocation })
  const router = new LowRouter(i18n.addLocaleParamToRoutes(routes), { base, id: 1 })
  // Request initial static props
  const initialStaticProps = await getStaticPropsFromUrl(staticLocation, router, i18n)
  // Current route props
  const props = initialStaticProps && Object.values(initialStaticProps)?.[0]

  return (
    <html lang={i18n.currentLocale.code}>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="x-ua-compatible" content="IE=Edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title>{props?.title || "app"}</title>
        <meta name="description" content={props?.description || ""} />
        <link rel="icon" type="image/png" sizes="32x32" href={"#"} />
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
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.__INITIAL_STATIC_PROPS__=${JSON.stringify(initialStaticProps, null, 2)?.replace(/\n\s+/g, "")}`,
          }}
        />
      </body>
    </html>
  )
}

// Utils

type TScript = { tag: string; attr: { [x: string]: string } }

const ScriptTag = ({ tag, attr }: TScript) => {
  const T = tag as any
  if (attr.noModule === "") return <T {...attr} noModule />
  else return <T {...attr} />
}
const ScriptsTags = ({ scripts }: { scripts: TScript[] }) => (
  <>
    {scripts?.map((script, i) => (
      <ScriptTag key={i} {...script} />
    ))}
  </>
)
