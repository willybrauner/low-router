import { createMatcher, Matcher, RegexFn } from "./createMatcher"
import { HistoryEvents } from "./historyPlugin"

export type RouteParams = { [paramName: string]: string }
export type RouteProps = Record<string, any>
export type ActionResult<A> = Promise<A> | A

export interface RouteContext<A = any, P = RouteProps> {
  pathname: string
  params: RouteParams
  baseUrl: string
  route: Route<A, P>
}

export interface Route<A, P> {
  path: string
  name?: string
  props?: P
  action?: (context: RouteContext<A, P>) => ActionResult<A>
}

export interface RouterOptions<A, P> {
  baseUrl: string
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
    this.#options.baseUrl = this.#options.baseUrl || "/"

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
    const routeContext: RouteContext = this.#getMatchRoute(pathname)
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
        const action = await routeContext.route.action?.(routeContext)
        this.#options.onResolve?.(routeContext, action)
        return Promise.resolve(action)
      }
    }
  }

  public pause(): void {
    this.#onPlugins((p) => p.onPause?.(this.currentContext))
    this.#options.onPause?.(this.currentContext)
  }

  /**
   * Takes pathname a return matching route
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
      this.#log(`'${formatRoutePath}' match with '${pathname}'?`, isMatch)
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

  #debug
  async #log(...args: any[]) {
    if (this.#options.debug) {
      if (!this.#debug) this.#debug = await import("@wbe/debug")
      const log = this.#debug.default("router:Router")
      log(...args)
    }
  }
}
