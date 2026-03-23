import "preact/debug"
import "./index.scss"
import App from "~/src/App"
import { hydrate } from "preact"
import { locales, routes, defaultLocaleInUrl } from "~/src/routes"
import { createBrowserHistory, LowRouter } from "@wbe/low-router"
import { StrictMode } from "preact/compat"
import { I18n, Router } from "@wbe/low-router-preact"

const base: string = import.meta.env.VITE_APP_BASE || "/"

// Init router
const i18n = new I18n(locales, { base, defaultLocaleInUrl })
const router = new LowRouter(i18n.addLocaleParamToRoutes(routes), { base, id: 1 })

hydrate(
  <StrictMode>
    <Router
      i18n={i18n}
      router={router}
      history={createBrowserHistory()}
      initialStaticProps={window["__INITIAL_STATIC_PROPS__"]}
    >
      <App />
    </Router>
  </StrictMode>,
  document.getElementById("root"),
)
