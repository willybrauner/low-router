import { createMatcher, Matcher } from "./createMatcher"
import { PathnameOrObject, Resolve, Route, RouteContext, RouteParams, RouterContext, RouterOptions } from "./types"

/**
 * LowRouter
 */
export class LowRouter<A = any, C extends RouterContext = RouterContext> {
  routes: Route<A, C>[]
  currentContext: RouteContext<A, C> | undefined
  #options: Partial<RouterOptions<A, C>>
  #matcher: Matcher

  constructor(routes: Route<A, C>[], options: Partial<RouterOptions<A, C>> = {}) {
    this.routes = routes
    this.#options = options
    this.#options.base = this.#options.base || "/"

    this.#log("routes", this.routes)
    this.#log("options", this.#options)

    this.#matcher = this.#options.matcher || createMatcher()
    this.#options.onInit?.()
  }

  /**
   * Resolve
   * return a Promise witch return the action result
   */
  public async resolve(pathnameOrObject: PathnameOrObject): Promise<Resolve<A, C>> {
    const obj = this.#resolver(pathnameOrObject)
    if (typeof obj.context.route?.action === "function") {
      obj.response = await obj.context.route.action(obj.context)
    }
    this.#options.onResolve?.(obj)
    return Promise.resolve(obj)
  }

  /**
   * ResolveSync
   * return response synchronously
   */
  public resolveSync(pathnameOrObject: PathnameOrObject): Resolve<A, C> {
    const obj = this.#resolver(pathnameOrObject)
    if (typeof obj.context?.route?.action === "function") {
      obj.response = obj.context.route.action(obj.context)
    }
    this.#options.onResolve?.(obj)
    return obj
  }

  /**
   * Common tread for resolve and resolveSync
   * @param pathnameOrObject
   * @private
   */
  #resolver(pathnameOrObject: PathnameOrObject) {
    // match route
    const routeContext = this.matchRoute(
      typeof pathnameOrObject === "string"
        ? pathnameOrObject
        : this.createUrl({ name: pathnameOrObject?.name, params: pathnameOrObject?.params })
    )
    // error
    if (!routeContext) {
      this.#log(`No matching route found with pathname ${pathnameOrObject}`, this.routes)
      this.#options.onError?.()
      return { response: undefined, context: undefined }
    }
    // save current context
    this.currentContext = routeContext
    this.#log("routeContext", routeContext)
    // resolve
    return { response: undefined, context: routeContext }
  }

  public dispose(): void {
    this.currentContext = null
    this.#options.onDispose?.()
  }

  /**
   * Takes pathname a return matching route object
   */
  matchRoute(
    pathname: string,
    base = this.#options.base,
    routes = this.routes
  ): RouteContext<A, C> | undefined {
    const next = (pathname, base, routes, parent): RouteContext<A, C> | undefined => {
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
          parent,
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
