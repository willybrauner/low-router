import { createMatcher, Matcher, RegexFn } from "./createMatcher"
import debug from "@wbe/debug"
const log = debug("lowrouter:Router")
//const { log } = console

export type HistoryEvents = "pushState" | "replaceState" | "popstate" | "hashchange"
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
  name: string
  props?: RouteProps
  action: (context: RouteContext) => void
}

export interface RouterOptions {
  baseUrl: string
  onError: (error) => void
  onUpdate: (context: RouteContext) => void
  pathToRegexFn: RegexFn
  debug: boolean
}

/**
 *
 * Router
 *
 */
export class Router {
  routes: Route[]
  currentRouteContext: RouteContext
  #events: HistoryEvents[] = ["pushState", "replaceState", "popstate", "hashchange"]
  #options: Partial<RouterOptions>
  #matcher: Matcher

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

    // HISTORY: could be a side effect...
    this.#patchHistory()
    this.#listenEvents()

    // First resolve
    try {
      this.resolve(window.location.pathname || "/")
    } catch (e) {
      this.#options.onError?.(e)
    }
  }

  /**
   * public
   *
   */
  // push route to...
  // TODO add object name & params
  public async resolve(pathname: string, eventType: HistoryEvents = "pushState"): Promise<void> {
    // get route from pathname
    const routeContext = this.#getMatchRoute(pathname)
    if (!routeContext) throw new Error(`No matching route found with pathname ${pathname}, return`)
    else {
      this.currentRouteContext = routeContext
      this.#options.debug && log("current route context", routeContext)
      // HISTORY: could be a side effect...
      // we don't want to push in history if event is popstate
      if (eventType != "popstate") {
        window.history[eventType]({}, null, pathname)
      }

      const context = {
        pathname,
        baseUrl: this.#options.baseUrl,
        route: this.currentRouteContext.route,
        params: this.currentRouteContext.params,
      }
      this.#options.onUpdate?.(context)
      await this.currentRouteContext.route.action(context)
    }
  }

  /**
   * private
   *
   *
   */
  // HISTORY: could be a side effect...
  #listenEvents() {
    for (const event of this.#events) {
      window.addEventListener(event, this.#handleHistory.bind(this))
    }
  }

  // HISTORY: could be a side effect...
  #unListenEvents() {
    for (const event of this.#events) {
      window.removeEventListener(event, this.#handleHistory)
    }
  }

  async #handleHistory(event) {
    const pathname = event?.["arguments"]?.[2] || window.location.pathname
    if (!pathname || pathname === this.currentRouteContext?.pathname) {
      return
    }
    await this.resolve(pathname, event?.type)
  }

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

  /**
   * While History API does have `popstate` event, the only
   * proper way to listen to changes via `push/replaceState`
   * is to monkey-patch these methods.
   * https://stackoverflow.com/a/4585031
   * https://stackoverflow.com/questions/5129386/how-to-detect-when-history-pushstate-and-history-replacestate-are-used
   */
  #patchHistory(): void {
    for (const type of ["pushState", "replaceState"]) {
      const original = history[type]
      history[type] = function () {
        const result = original.apply(this, arguments)
        const event = new Event(type)
        event["arguments"] = arguments
        dispatchEvent(event)
        return result
      }
    }
  }
}
