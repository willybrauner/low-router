import { createMatcher } from "./createMatcher"
import debug from "@wbe/debug"
const log = debug("lowrouter:Router")

export type RouteParams = { [paramName: string]: string }

export interface RouteContext {
  pathname: string
  params: RouteParams
  baseUrl: string
  route: Route
}

export interface Route {
  path: string
  name: string
  action: (context: RouteContext) => void
}

export interface RouterOptions {
  baseUrl: string
  errorHandler: (error) => void
}

/**
 *
 * Router
 *
 */
export class Router {
  #events = ["pushState", "replaceState", "popstate"]
  #routes: Route[]
  #options: Partial<RouterOptions>
  #matcher = createMatcher()
  #currentRouteContext: RouteContext

  constructor(
    routes: Route[],
    options: Partial<RouterOptions> = { baseUrl: "/", errorHandler: (error) => {} }
  ) {
    this.#routes = routes
    this.#options = options
    this.#patchHistory()
    this.#listenEvents()
    // First resolve
    try {
      this.resolve(window.location.pathname || "/")
    } catch (e) {
      this.#options.errorHandler(e)
    }
  }

  /**
   * public
   *
   */
  // push route to...
  // TODO add object name & params
  public async resolve(pathname: string): Promise<void> {
    // get route from pathname

    const routeContext = this.#getRouteContextFromPathname(pathname)
    if (!routeContext) {
      throw new Error(`No matching route found with pathname ${pathname}, return`)
    } else {
      log("current route context", routeContext)
      this.#currentRouteContext = routeContext

      window.history.pushState({}, null, pathname)

      await this.#currentRouteContext.route.action({
        pathname,
        baseUrl: this.#options.baseUrl,
        route: this.#currentRouteContext.route,
        params: this.#currentRouteContext.params,
      })
    }
  }

  stop() {
    this.#unListenEvents()
  }

  /**
   * private
   *
   *
   */
  #listenEvents() {
    for (const event of this.#events) {
      window.addEventListener(event, this.#handleHistory.bind(this))
    }
  }

  #unListenEvents() {
    for (const event of this.#events) {
      window.removeEventListener(event, this.#handleHistory)
    }
  }

  async #handleHistory(event) {
    const pathname = event?.["arguments"]?.[2] || window.location.pathname
    if (!pathname || pathname === this.#currentRouteContext?.pathname) return
    this.resolve(pathname)
  }

  #getRouteContextFromPathname(pathname: string, baseUrl = this.#options.baseUrl): RouteContext {
    let hasMatch = false

    for (let route of this.#routes) {
      // remove double slash if exist
      const formatRoutePath = `${baseUrl}${route.path}`.replace(/(\/)+/g, "/")
      const [isMatch, params] = this.#matcher(formatRoutePath, pathname)
      // log(`'${formatRoutePath}' match with '${pathname}'?`, isMatch)

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

  /**
   * While History API does have `popstate` event, the only
   * proper way to listen to changes via `push/replaceState`
   * is to monkey-patch these methods.
   * https://stackoverflow.com/a/4585031
   * https://stackoverflow.com/questions/5129386/how-to-detect-when-history-pushstate-and-history-replacestate-are-used
   */
  #patchHistory(): void {
    if (typeof window.history === "undefined") return
    for (const type of ["pushState", "replaceState"]) {
      const original = window.history[type]
      window.history[type] = function () {
        const result = original.apply(this, arguments)
        const event = new Event(type)
        event["arguments"] = arguments
        window.dispatchEvent(event)
        return result
      }
    }
  }
}
