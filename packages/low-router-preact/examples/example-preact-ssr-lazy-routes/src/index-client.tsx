import "preact/debug"
import "./index.scss"
import App from "~/src/components/App/App"
import * as packageJson from "../package.json"
import debug from "@wbe/debug"
import { render, hydrate } from "preact"
import { routes } from "~/src/routes"
import { createBrowserHistory, LowRouter } from "@wbe/low-router"
import { StrictMode } from "preact/compat"
import { Router } from "@wbe/low-router-preact"

const log = debug("front:index")
log("version:", packageJson["version"])

const base: string = process.env.VITE_APP_BASE || import.meta.env.VITE_APP_BASE
log("Selected base", base)

const router = new LowRouter(routes, { base, id: 1 })

const root = document.getElementById("root")
const dom = (
  <StrictMode>
    <Router router={router} history={createBrowserHistory()} initialStaticProps={window["__INITIAL_STATIC_PROPS__"]}>
      <App />
    </Router>
  </StrictMode>
)

if (import.meta.env.SPA) render(dom, root)
else hydrate(dom, root)
