import "preact/debug"
import "./index.scss"
import App from "~/components/App/App"
import * as packageJson from "../package.json"
import debug from "@wbe/debug"
import { render, hydrate } from "preact"
import { locales, routes, defaultLocaleInUrl } from "~/routes"
import { createBrowserHistory, LowRouter } from "@wbe/low-router"
import { StrictMode } from "preact/compat"
import { I18n, Router } from "@wbe/low-router-preact"

const log = debug("front:index")
log("version:", packageJson["version"])
log("public env:", import.meta.env)

/**
 * Base
 * Load process.env base if is available by external load, else we get vite app base
 * (process.env.VITE_APP_BASE is replaced on build by vite (check vite.config.ts)
 */
const base: string = process.env.VITE_APP_BASE || import.meta.env.VITE_APP_BASE
log("Selected base", base)

// Init router
const i18n = new I18n(locales, { base, defaultLocaleInUrl })
const router = new LowRouter(i18n.addLocaleParamToRoutes(routes), { base, id: 1 })

/**
 * Render or hydrate the app, depends on build type
 */
const root = document.getElementById("root")
const dom = (
  <StrictMode>
    <Router
      i18n={i18n}
      router={router}
      history={createBrowserHistory()}
      initialStaticProps={window["__INITIAL_STATIC_PROPS__"]}
    >
      <App />
    </Router>
  </StrictMode>
)

if (import.meta.env.SPA) render(dom, root)
else hydrate(dom, root)
