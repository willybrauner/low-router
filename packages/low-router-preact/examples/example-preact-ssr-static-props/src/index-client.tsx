import "preact/debug"
import "./index.scss"
import App from "~/src/App"
import { hydrate } from "preact"
import { routes } from "~/src/routes"
import { createBrowserHistory, LowRouter } from "@wbe/low-router"
import { StrictMode } from "preact/compat"
import { Router } from "@wbe/low-router-preact"

const base: string = import.meta.env.VITE_APP_BASE || "/"

const router = new LowRouter(routes, { base, id: 1 })

hydrate(
  <StrictMode>
    <Router
      router={router}
      history={createBrowserHistory()}
      initialStaticProps={window["__INITIAL_STATIC_PROPS__"]}
    >
      <App />
    </Router>
  </StrictMode>,
  document.getElementById("root"),
)
