import "@wbe/low-router"
import { Locale } from "~/core/router"

/**
 * Augmentation of Route & RouteContext interfaces
 */
declare module "@wbe/low-router" {
  interface Route {
    name: string
    getStaticProps?: (props: Record<any, any>, locale: Locale) => Promise<any>
    translations?: Record<string, string>
    path?: string
  }
  export interface RouteContext {
    routeId: number
    route: Route
  }
}
