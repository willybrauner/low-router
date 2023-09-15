import { createMatcher, Matcher, RegexFn } from "./createMatcher"
import { HistoryEvents } from "./historyPlugin"

export type RouteParams = { [paramName: string]: string }
export type QueryParams = { [paramName: string]: string }
export type RouteProps = Record<string, any>
export type ActionResult<A> = Promise<A> | A

export interface RouteContext<A = any, P = RouteProps> {
  pathname: string
  params: RouteParams
  base: string
  route: Route<A, P>
}

export interface Route<A, P> {
  path: string
  name?: string
  props?: P
  children?: Route<A, P>[] | null
  parent?: Route<A, P> | null
  action?: (context?: RouteContext<A, P>) => ActionResult<A>
}

export interface RouterOptions<A, P> {
  base: string
  onInit: () => void
  onResolve: (context: RouteContext<A, P>, actionResult: ActionResult<A>) => void
  onPause: (context: RouteContext<A, P>) => void
  onError: () => void
  pathToRegexFn: RegexFn
  debug: boolean
  plugins: RouterPlugin[]
}

export interface RouterPluginHooks {
  onInit?: () => void
  onResolve?: (context: RouteContext, eventType: HistoryEvents) => void
  onPause?: (context: RouteContext) => void
  onError?: () => void
}

export type RouterPlugin = (router: Router) => RouterPluginHooks

/**
 * Router
 */
export class Router<A = any, P = RouteProps> {
  routes: Route<A, P>[]
  currentContext: RouteContext<A, P>
  #options: Partial<RouterOptions<A, P>>
  #matcher: Matcher
  #plugins: RouterPluginHooks[] = []

  constructor(routes: Route<A, P>[], options: Partial<RouterOptions<A, P>> = {}) {
    // add {} as default for each route props
    this.routes = routes.map((r) => ({ ...r, props: (r.props || {}) as P }))
    this.#options = options
    this.#options.base = this.#options.base || "/"

    this.#log("routes", this.routes)
    this.#log("options", this.#options)

    this.#matcher = createMatcher(this.#options.pathToRegexFn)
    this.#options.onInit?.()
    this.#plugins = this.#options.plugins?.map((p) => p(this))
    this.#onPlugins((p) => p.onInit?.())
  }

  /**
   * Resolve
   * return a Promise witch return the action return fn
   * // TODO add object name & params
   */
  public async resolve(pathname: string, eventType: HistoryEvents = "pushState"): Promise<A> {
    const routeContext: RouteContext = this.matchRoute(pathname)
    if (!routeContext) {
      console.error(`No matching route found with pathname ${pathname}`)
      this.#options.onError?.()
      this.#onPlugins((p) => p.onError?.())
    } else {
      // save current context
      this.currentContext = routeContext
      this.#log("routeContext", routeContext)
      // update plugins
      this.#onPlugins((p) => p.onResolve?.(this.currentContext, eventType))
      // resolve
      if (typeof routeContext.route?.action === "function") {
        const actionResponse = await routeContext.route.action?.(routeContext)
        this.#options.onResolve?.(routeContext, actionResponse)
        return Promise.resolve(actionResponse)
      }
    }
  }

  public pause(): void {
    this.#onPlugins((p) => p.onPause?.(this.currentContext))
    this.#options.onPause?.(this.currentContext)
  }

  /**
   * Takes pathname a return matching route
   *
   */
  matchRoute(
    pathname: string,
    base = this.#options.base,
    routes = this.routes
  ): RouteContext | undefined {
    /**
     * recursive next call
     */
    const next = ({
      pathname,
      base,
      routes,
      parent,
    }: {
      pathname: string
      base: string
      routes: Route<A, P>[]
      parent?: Route<A, P>
    }): RouteContext | undefined => {
      for (let route of routes) {
        const formatRoutePath = `${base}${route.path}`.replace(/(\/)+/g, "/")
        const [isMatch, params] = this.#matcher(formatRoutePath, pathname)
        this.#log(`'${formatRoutePath}' match with '${pathname}'?`, isMatch)
        if (isMatch) {
          return {
            pathname,
            params,
            route: route.children?.[0] ?? route,
            base,
          }
        } else if (route.children) {
          const childResult = next({
            pathname,
            base: formatRoutePath,
            routes: route.children,
            parent: route.parent || route,
          })
          if (childResult) return childResult
        }
      }
    }
    const result = next({
      pathname,
      base,
      routes,
      parent: null,
    })
    if (result) return result
  }

  #onPlugins(fn: (plugin: RouterPluginHooks) => void): void {
    this.#plugins?.forEach((plugin) => fn?.(plugin))
  }

  #debug
  async #log(...args: any[]) {
    if (this.#options.debug) {
      if (!this.#debug) this.#debug = await import("@wbe/debug")
      const log = this.#debug.default("router:Router")
      log(...args)
    }
  }
}
