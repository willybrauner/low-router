import React from "react"
import ReactDOM from "react-dom/client"
import App from "./components/app/App.tsx"
import "./index.css"
import { routes } from "./routes.tsx"
import { Router } from "./lowRouterReact/Router.tsx"
import { createBrowserHistory } from "@wbe/low-router"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router routes={routes} options={{ id: 1 }} history={createBrowserHistory()}>
    <App />
  </Router>
)
