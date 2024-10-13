import "@wbe/low-router"
import { Locale } from "./services/I18n"
import { RouteProps } from "@wbe/low-router"

declare module "@wbe/low-router" {
  export interface Route {
    path?: string
    name: string
    getStaticProps?: (context: RouteContext, locale: Locale) => Promise<any>
    translations?: Record<string, string>
    _props?: RouteProps
  }

  export interface RouteContext {
    routeId: number
    route: Route
  }
}
