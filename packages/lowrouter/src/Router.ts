import { createMatcher, Matcher, RegexFn } from "./createMatcher"
import { HistoryEvents } from "./historyPlugin"
// import debug from "@wbe/debug"
//const log = debug("lowrouter:Router")
const { log } = console

export type RouteParams = { [paramName: string]: string }
export type RouteProps = { [name: string]: any }

export interface RouteContext {
  pathname: string
  params: RouteParams
  baseUrl: string
  route: Route
}

export interface Route {
  path: string
  name?: string
  props?: RouteProps
  action?: (context: RouteContext) => void
}

export interface RouterOptions {
  baseUrl: string
  onInit: () => void
  onBeforeUpdate: (context: RouteContext) => void
  onUpdate: (context: RouteContext) => void
  onPause: (context: RouteContext) => void
  onError: (error) => void
  pathToRegexFn: RegexFn
  debug: boolean
  plugins: RouterPlugin[]
}

export interface RouterPluginHooks {
  onInit?: () => void
  onBeforeUpdate?: (context: RouteContext, eventType: HistoryEvents) => void
  onAfterUpdate?: (context: RouteContext, eventType: HistoryEvents) => void
  onPause?: (context: RouteContext) => void
  onError?: (error) => void
}

export type RouterPlugin = (router: Router) => RouterPluginHooks

/**
 * Router
 */
export class Router {
  routes: Route[]
  currentRouteContext: RouteContext
  #options: Partial<RouterOptions>
  #matcher: Matcher
  #plugins: RouterPluginHooks[] = []

  constructor(
    routes: Route[],
    options: Partial<RouterOptions> = {
      baseUrl: "/",
      debug: false,
    }
  ) {
    this.routes = routes
    this.#options = options
    this.#matcher = createMatcher(this.#options.pathToRegexFn)
    this.#options.onInit?.()
    this.#plugins = this.#options.plugins?.map((p) => p(this))
    this.#onPlugins((p) => p.onInit?.())
  }

  /**
   * Resolve
   * equivalent to push method
   * // TODO add object name & params
   */
  public async resolve(
    pathname: string,
    eventType: HistoryEvents = "pushState"
  ): Promise<RouteContext> {
    // get route from pathname
    const routeContext: RouteContext = this.#getMatchRoute(pathname)
    if (!routeContext) {
      const m = `No matching route found with pathname ${pathname}`
      console.error(m)
      this.#options.onError?.(m)
      this.#onPlugins((p) => p.onError?.(m))
    } else {
      this.#options.debug && log("current route context", routeContext)
      this.currentRouteContext = routeContext
      this.#onPlugins((p) => p.onBeforeUpdate?.(this.currentRouteContext, eventType))

      this.#options.onUpdate?.(this.currentRouteContext)
      await this.currentRouteContext.route?.action?.(this.currentRouteContext)
      this.#onPlugins((p) => p.onAfterUpdate(this.currentRouteContext, eventType))

      return this.currentRouteContext
    }
  }

  pause(): void {
    this.#onPlugins((p) => p.onPause?.(this.currentRouteContext))
    this.#options.onPause?.(this.currentRouteContext)
  }

  /**
   *
   * @param pathname
   * @param baseUrl
   * @private
   */
  #getMatchRoute(pathname: string, baseUrl = this.#options.baseUrl): RouteContext {
    let hasMatch = false
    for (let route of this.routes) {
      // remove double slash if exist
      const formatRoutePath = `${baseUrl}${route.path}`.replace(/(\/)+/g, "/")
      const [isMatch, params] = this.#matcher(formatRoutePath, pathname)
      this.#options.debug && log(`'${formatRoutePath}' match with '${pathname}'?`, isMatch)
      if (isMatch) {
        hasMatch = true
        return {
          pathname,
          params,
          route,
          baseUrl: this.#options.baseUrl,
        }
      }
    }
    if (!hasMatch) return
  }

  #onPlugins(fn: (plugin: RouterPluginHooks) => void): void {
    this.#plugins?.forEach((plugin) => fn?.(plugin))
  }
}
