import "@wbe/low-router"
import { Locale } from "./services/I18n"

declare module "@wbe/low-router" {
  export interface Route {
    path?: string
    name: string
    getStaticProps?: (props: Record<any, any>, locale: Locale) => Promise<any>
    translations?: Record<string, string>
  }

  export interface RouteContext {
    routeId: number
    route: Route
  }
}
