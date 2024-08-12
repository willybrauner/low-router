import { createMatcher, Matcher } from "./createMatcher"
import debug from "@wbe/debug"
import { PathnameOrObject, Resolve, Route, RouteContext, RouteParams, RouterOptions } from "./types"

const log = debug("low-router")
/**
 * LowRouter
 */
export class LowRouter {
  routes: Route[]
  currentContext: RouteContext | undefined
  options: Partial<RouterOptions>
  matcher: Matcher

  constructor(routes: Route[], options: Partial<RouterOptions> = {}) {
    this.routes = routes
    this.options = options
    this.options.base = this.options.base || "/"
    this.options.id = this.options.id || 1

    this.#log("routes", this.routes)
    this.#log("options", this.options)

    this.matcher = this.options.matcher || createMatcher()
    this.options.onInit?.()
  }

  /**
   * Resolve
   * return a Promise witch return the action result
   */
  public async resolve(pathnameOrObject: PathnameOrObject): Promise<Resolve> {
    const obj = this.#resolver(pathnameOrObject)
    if (typeof obj.context.route?.action === "function") {
      obj.response = await obj.context.route.action(obj.context)
    }
    this.options.onResolve?.(obj)
    return Promise.resolve(obj)
  }

  /**
   * ResolveSync
   * return response synchronously
   */
  public resolveSync(pathnameOrObject: PathnameOrObject): Resolve {
    const obj = this.#resolver(pathnameOrObject)
    if (typeof obj.context?.route?.action === "function") {
      obj.response = obj.context.route.action(obj.context)
    }
    this.options.onResolve?.(obj)
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
      this.options.onError?.()
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
    this.options.onDispose?.()
  }

  /**
   * Takes pathname a return matching route object
   */
  matchRoute(
    pathname: string,
    base = this.options.base,
    routes = this.routes
  ): RouteContext | undefined {
    const next = (pathname, base, routes, parent): RouteContext | undefined => {
      for (let route of routes) {
        const formatRoutePath = `${base}${route.path}`.replace(/(\/)+/g, "/")
        const [isMatch, params, query, hash] = this.matcher(formatRoutePath, pathname)
        const relativePathname = LowRouter.compilePath(route.path)(params)
        this.#log(`'${formatRoutePath}' match with '${pathname}'?`, isMatch)

        const currContext = {
          pathname,
          params,
          query,
          hash,
          route,
          base,
          parent,
          relativePathname,
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
    const next = (name, params, routes, curBase): string => {
      for (let route of routes) {
        if (route.name === name) {
          return (curBase + LowRouter.compilePath(route.path)(params)).replace(/(\/)+/g, "/")
        } else if (route.children?.length > 0) {
          const match = next(
            name,
            params,
            route.children,
            curBase + LowRouter.compilePath(route.path)(params)
          )
          if (match) return match
        }
      }
    }
    return next(name, params, this.routes, this.options.base)
  }

  /**
   * Compile path
   * ex:
   *  compilePath("/foo/:id", {id: "bar"}) -> /foo/bar
   *  compilePath("/foo/:id?", {id: "bar"}) -> /foo/bar
   *  compilePath("/foo?param=one", {id: "bar"}) -> /foo?param=one
   * @param path
   */
  public static compilePath(path: string): (params: RouteParams) => string {
    return (params) => {
      const [pathWithoutHash, hash] = path.split("#")
      const query = /\?(?!\/).+$/.exec(pathWithoutHash)?.[0]
      const pathWithoutQuery = pathWithoutHash.replace(query, "")
      const s = pathWithoutQuery
        .replace(/:([^/?]+)(\?)?/g, (match, key) => params?.[key] ?? "")
        .replace(/(\/)+/g, "/")
      return (
        (s.endsWith("/") && s !== "/" ? s.slice(0, -1) : s) +
        (query ? `${query}` : "") +
        (hash ? `#${hash}` : "")
      )
    }
  }

  #log(...rest: any[]): void {
    log(this.options?.id || "", ...rest)
  }
}
