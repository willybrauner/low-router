import { lazy } from "preact/compat"
import HomePage from "~/src/pages/HomePage"
import WorkPage from "~/src/pages/WorkPage"
import { Route } from "@wbe/low-router"

// Lazy-loaded pages — created once outside action() to keep the reference stable
const LazyAboutPage = lazy(() => import("~/src/pages/AboutPage"))
const LazyNotFoundPage = lazy(() => import("~/src/pages/NotFoundPage"))

export const routes = [
  {
    path: "/",
    name: "home",
    // non-lazy: imported directly at the top of the file
    action: () => HomePage,
  },
  {
    path: "/about",
    name: "about",
    // lazy: loaded on demand, wrapped in Suspense by Stack
    action: () => LazyAboutPage,
  },
  {
    path: "/work/:id",
    name: "work",
    // non-lazy: imported directly at the top of the file
    action: () => WorkPage,
  },
  {
    path: "/:404*",
    name: "not-found",
    // lazy: loaded on demand, wrapped in Suspense by Stack
    action: () => LazyNotFoundPage,
  },
] as const satisfies Route[]
