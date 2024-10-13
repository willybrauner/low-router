import HomePage from "~/pages/HomePage"
import WorkPage from "~/pages/WorkPage"
import { Locale } from "@wbe/low-router-preact"
import { Route } from "@wbe/low-router"

export const routes = [
  {
    path: "/",
    name: "home",
    action: () => HomePage,
    getStaticProps: async (context, locale) => {
      const data = await fetch(
        "https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1",
      )
      const res = await data.json()
      return {
        title: `hello home`,
        content: res,
      }
    },
  },
  {
    path: "/work/:id",
    name: "work",
    action: () => WorkPage,
    getStaticProps: async (context, locale) => {
      if (import.meta.env.SSR) {
        console.log("context", context.params.id)
        return { data: { title: `staticProps title ${context.params.id} [SERVER REQUEST]` } }
      }
    },
  },
] as const satisfies Route[]

/**
 * Locale
 */
export const locales: Locale[] = [{ code: "fr" }]
export const defaultLocaleInUrl = false
