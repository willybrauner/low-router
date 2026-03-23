import HomePage from "~/src/pages/HomePage"
import WorkPage from "~/src/pages/WorkPage"
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
        title: `
        - data come from getStaticProps ⬇
        `,
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
