import { createMatcher, Matcher } from "./createMatcher"
import { Route, RouteContext, RouteParams, RouteProps, RouterOptions } from "./types"

/**
 * Router
 */
export class Router<A = any, P = RouteProps> {
  routes: Route<A, P>[]
  currentContext: RouteContext
  #options: Partial<RouterOptions<A, P>>
  #matcher: Matcher

  constructor(routes: Route<A, P>[], options: Partial<RouterOptions<A, P>> = {}) {
    this.routes = routes
    this.#options = options
    this.#options.base = this.#options.base || "/"

    this.#log("routes", this.routes)
    this.#log("options", this.#options)

    this.#matcher = createMatcher(this.#options.pathToRegexFn)
    this.#options.onInit?.()
  }

  /**
   * Resolve
   * return a Promise witch return the action result
   */
  public async resolve(
    pathnameOrObject: string | { name: string; params: RouteParams }
  ): Promise<A> {
    // match route
    const routeContext = this.matchRoute(
      typeof pathnameOrObject === "string"
        ? pathnameOrObject
        : this.createUrl({ name: pathnameOrObject?.name, params: pathnameOrObject?.params })
    )

    if (routeContext?.pathname === this.currentContext?.pathname) {
      this.#log("same path, return")
      return
    }

    // error
    if (!routeContext) {
      this.#log(`No matching route found with pathname ${pathnameOrObject}`)
      this.#options.onError?.()
      return
    }

    // save current context
    this.currentContext = routeContext
    this.#log("routeContext", routeContext)
    this.#log("routeContext.route.parent", routeContext.parent)

    // resolve
    if (typeof routeContext.route?.action === "function") {
      const actionResponse = await routeContext.route.action?.(routeContext)
      this.#options.onResolve?.(routeContext, actionResponse)
      return Promise.resolve(actionResponse)
    }
  }

  public dispose(): void {
    this.#options.onDispose?.()
  }

  /**
   * Takes pathname a return matching route object
   */
  matchRoute(
    pathname: string,
    base = this.#options.base,
    routes = this.routes
  ): RouteContext | undefined {
    const next = (pathname, base, routes, parentContext): RouteContext | undefined => {
      for (let route of routes) {
        const formatRoutePath = `${base}${route.path}`.replace(/(\/)+/g, "/")
        const [isMatch, params, query, hash] = this.#matcher(formatRoutePath, pathname)
        this.#log(`${formatRoutePath} match with ${pathname}?`, isMatch)

        const currContext = {
          pathname,
          params,
          query,
          hash,
          route,
          base,
          parent: parentContext,
        }

        if (isMatch) {
          return currContext
        } else if (route.children) {
          const childResult = next(pathname, formatRoutePath, route.children, currContext)
          if (childResult) return childResult
        }
      }
    }
    const result = next(pathname, base, routes, null)
    if (result) return result
  }

  /**
   * Create URL
   * ex:
   *  createUrl({ name: "home" }) => "/"
   *  createUrl({ name: "user", params: { id: "1" } }) => "/user/1"
   */
  public createUrl({ name, params = {} }: { name: string; params?: RouteParams }): string {
    const compile = (path, params): string => {
      const s = path.replace(/:([^/?]+)(\?)?/g, (match, key) => params?.[key] ?? "")
      return s.endsWith("/") ? s.slice(0, -1) : s
    }
    const next = (name, params, routes, curBase): string => {
      for (let route of routes) {
        if (route.name === name) {
          return (curBase + compile(route.path, params)).replace(/(\/)+/g, "/")
        } else if (route.children?.length > 0) {
          const match = next(name, params, route.children, curBase + compile(route.path, params))
          if (match) return match
        }
      }
    }
    return next(name, params, this.routes, this.#options.base)
  }

  #log(...rest: any[]): void {
    this.#options.debug &&
      console.log(`%clow-router`, `color: rgb(16,96,173)`, this.#options?.id || "", ...rest)
  }
}
