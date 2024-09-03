import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"
import { Router } from "@wbe/low-router-react"
import { createBrowserHistory, LowRouter } from "@wbe/low-router"
import HomePage from "./pages/HomePage"
import AboutPage from "./pages/AboutPage"

const routes = [
  {
    path: "/",
    name: "home",
    action: () => HomePage,
  },
  {
    path: "/about",
    name: "about",
    action: () => AboutPage,
  },
]
const router = new LowRouter(routes, { base: "/", id: 1 })

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router router={router} history={createBrowserHistory()}>
      <App />
    </Router>
  </StrictMode>
)
