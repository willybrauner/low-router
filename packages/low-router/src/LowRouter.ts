import debug from "@wbe/debug"
import { PathnameOrObject, QueryParams, Resolve, Route, RouteContext, RouteParams, RouterOptions } from "./types"
import { createMatcher, Matcher } from "./utils/createMatcher"
import { compilePath as defaultCompilePath, CompilePath } from "./utils/compilePath"
import { normalizePath } from "./utils/normalizePath"

const log = debug("low-router")
/**
 * LowRouter
 */
export class LowRouter {
  routes: Route[]
  currentContext: RouteContext | undefined
  options: Partial<RouterOptions>
  matcher: Matcher
  compilePath: CompilePath

  constructor(routes: Route[], options: Partial<RouterOptions> = {}) {
    this.routes = routes
    this.options = options
    this.options.base = this.options.base || "/"
    this.options.id = this.options.id || 1

    this.#log("routes", this.routes)
    this.#log("options", this.options)

    this.matcher = this.options.matcher || createMatcher()
    this.compilePath = this.options.compilePath || defaultCompilePath
    this.options.onInit?.()
  }

  /**
   * Resolve
   * return a Promise witch return the action result
   */
  public async resolve(pathnameOrObject: PathnameOrObject): Promise<Resolve> {
    const obj = this.#resolver(pathnameOrObject)
    if (typeof obj.context?.route?.action === "function") {
      obj.response = await obj.context.route.action(obj.context)
    }
    if (obj.context) this.options.onResolve?.(obj)
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
    if (obj.context) this.options.onResolve?.(obj)
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
        : this.createUrl(pathnameOrObject)
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
    // walk the parent chain to break references and help GC
    let ctx: RouteContext | undefined | null = this.currentContext
    while (ctx) {
      const parent = ctx.parent
      ctx.parent = null
      ctx = parent
    }
    this.currentContext = undefined
    this.options.onDispose?.()
  }

  /**
   * Takes pathname a return matching route object
   */
  public matchRoute(
    pathname: string,
    base = this.options.base,
    routes = this.routes
  ): RouteContext | undefined {
    const next = (pathname, base, routes, parent): RouteContext | undefined => {
      for (let route of routes) {
        const fPath = normalizePath(base + route.path)
        const [isMatch, params, query, hash] = this.matcher(fPath, pathname)
        this.#log(`'${fPath}' match with '${pathname}'?`, isMatch)

        let relativePathname: string | undefined
        try {
          relativePathname = this.compilePath(route.path)(params)
        } catch (e) {
          this.#log("compilePath error", route.path, e)
        }

        const ctx = {
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
          return ctx
        } else if (route.children) {
          const childResult = next(pathname, fPath, route.children, ctx)
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
   *  createUrl({ name: "user", params: { id: "1" }, query: { tab: "x" }, hash: "top" }) => "/user/1?tab=x#top"
   */
  public createUrl({
    name,
    params = {},
    query,
    hash,
  }: {
    name: string
    params?: RouteParams
    query?: QueryParams
    hash?: string
  }): string | undefined {
    const next = (name, params, routes, curBase): string | undefined => {
      for (let route of routes) {
        const compiledPath = normalizePath(this.compilePath(curBase + route.path)(params))
        if (route.name === name) {
          return compiledPath
        } else if (route.children?.length > 0) {
          const match = next(name, params, route.children, compiledPath)
          if (match) return match
        }
      }
    }
    const pathname = next(name, params, this.routes, this.options.base)
    if (!pathname) return undefined

    // append query string
    let qs = ""
    if (query) {
      const sp = new URLSearchParams()
      for (const k in query) {
        const v = query[k]
        if (v != null) sp.append(k, String(v))
      }
      const s = sp.toString()
      if (s) qs = `?${s}`
    }
    // append hash
    const h = hash ? (hash[0] === "#" ? hash : `#${hash}`) : ""
    return pathname + qs + h
  }

  #log(...rest: any[]): void {
    log(this.options?.id || "", ...rest)
  }
}
