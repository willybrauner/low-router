import { createMatcher } from "./createMatcher"

export interface Route {
  path: string
  name: string
  action: (context: RouteContext) => void
}

/**
 * Params is a key/value object that represents extracted URL parameters.
 */
export interface RouteParams {
  [paramName: string]: string | string[]
}

export interface RouteContext {
  pathname: string // url
  router: Router
  route: Route
  baseUrl: string
  path: string
  params: RouteParams
}

export interface RouterOptions {
  baseUrl: string
  errorHandler: (context?) => void
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

  constructor(routes: Route[], options: Partial<RouterOptions> = {}) {
    this.#routes = routes
    this.#options = options

    this.#patchHistory()
    this.#handleHistory(window.location.pathname || "/")
    this.#listenEvents()
  }

  /**
   * public
   *
   */

  // push route to...
  // TODO add object name & params
  public async resolve(pathname: string) {
    // get route from pathname
    const route: Route = this.#getRouteFromPathname(pathname)
    window.history.pushState({}, null, pathname)

    // TODO retourner un truc
    await route.action(null)
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
    if (!pathname) return
    //   const route = this.#getRouteFromPathname(pathname)
    // window.history.pushState({}, null, pathname)
    //      await route.action(null)
  }

  #getRouteFromPathname(pathname: string): Route {
    let matchingRoute: Route

    for (let route of this.#routes) {
      const [isMatch] = this.#matcher(route.path, pathname)
      if (isMatch) return route
    }

    if (!matchingRoute) {
      console.warn("No matching route found with pathname", pathname)
    }
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
