import React from "react"
import ReactDOM from "react-dom/client"
import App from "./components/app/App.tsx"
import "./index.css"
import { routes } from "./routes.tsx"
import { historyPlugin } from "@wbe/low-router"
import { Router } from "./lowRouterReact/Router.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router routes={routes} options={{ debug: true, plugins: [historyPlugin], id: 1 }}>
    <App />
  </Router>
)
