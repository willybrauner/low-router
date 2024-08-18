import { h } from "preact"
import { LowRouter, Route, RouterOptions, RouteContext, HistoryAPI } from "@wbe/low-router"
import { createContext, memo, ReactElement, useEffect, useReducer } from "preact/compat"
import { useRef } from "preact/hooks"
import debug from "@wbe/debug"
import { isServer } from "@wbe/utils"
import { composeUrlByRouteName, I18n, InitialStaticProps, safeMergeObjects, useCache } from ".."
import { CacheAPI } from "../core/useCache"

// ------------------------------------------------------------------------------------------------- GLOBAL

export interface IRouterContext {
  prevContext: RouteContext
  currentContext: RouteContext
  router: LowRouter
  base: string
  routes: Route[]
  options: Partial<RouterOptions>
  history: HistoryAPI | any
  counter: number
  staticLocation: string
  i18n: I18n
}

export const RouterContext = createContext<IRouterContext>({
  prevContext: null,
  currentContext: null,
  router: null,
  base: null,
  routes: null,
  options: null,
  history: null,
  counter: 0,
  staticLocation: null,
  i18n: null,
})

interface IRouters {
  router: LowRouter
  base: string
  routes: Route[]
  history: any
  currentContext: RouteContext
  staticLocation: string
  initialStaticProps: InitialStaticProps
  staticPropsCache: Record<string, Record<string, any>>
  isFirstRoute: boolean
  routeCounter: number
  i18n: I18n
}

export const ROUTERS: IRouters = {
  router: undefined,
  base: undefined,
  routes: undefined,
  history: undefined,
  currentContext: undefined,
  staticLocation: undefined,
  initialStaticProps: undefined,
  staticPropsCache: {},
  isFirstRoute: true,
  routeCounter: 0,
  i18n: null,
}

const log = debug("low-router:Router")
const IS_SERVER = isServer()
let routeId = 0

// ------------------------------------------------------------------------------------------------- ROUTER

/**
 * LowRouter
 * A Single react/preact router instance
 *
 * - takes
 *
 *
 */
function LowReactRouter(props: {
  router: LowRouter
  children: ReactElement | ReactElement[]
  history?: HistoryAPI | any
  staticLocation?: string
  initialStaticProps?: InitialStaticProps
  i18n?: I18n
}) {
  const id = props.router.options?.id
  const IS_ROOT_ROUTER = !!props.staticLocation || !!props.history

  // reset store values on server side if is root router
  const first = useRef(true)
  if (IS_SERVER && IS_ROOT_ROUTER && first.current) {
    first.current = false
    ROUTERS.router = undefined
    ROUTERS.base = undefined
    ROUTERS.routes = undefined
    ROUTERS.history = undefined
    ROUTERS.currentContext = undefined
    ROUTERS.staticLocation = undefined
    ROUTERS.initialStaticProps = undefined
    ROUTERS.staticPropsCache = {}
    ROUTERS.isFirstRoute = true
    ROUTERS.routeCounter = 0
    ROUTERS.i18n = undefined
  }

  if (!ROUTERS.router) ROUTERS.router = props.router
  if (!ROUTERS.base) ROUTERS.base = props.router.options.base
  if (!ROUTERS.i18n) ROUTERS.i18n = props.i18n
  if (!ROUTERS.routes) ROUTERS.routes = props.router.routes as Route[]
  if (!ROUTERS.history) ROUTERS.history = props.history
  if (!ROUTERS.staticLocation) ROUTERS.staticLocation = props.staticLocation
  if (!ROUTERS.initialStaticProps) ROUTERS.initialStaticProps = props.initialStaticProps

  /**
   * Global reducer to store current and previous context
   */
  const [state, dispatch] = useReducer(
    (
      state: { prevContext: RouteContext; currentContext: RouteContext; counter: number },
      action: { type: "update"; currentContext?: RouteContext }
    ) => {
      switch (action.type) {
        case "update":
          return {
            prevContext: state.currentContext,
            currentContext: action.currentContext,
            counter: state.counter + 1,
          }
      }
    },
    {
      prevContext: null,
      currentContext: null,
      counter: 0,
    }
  )

  /**
   * Router instance dispose
   */
  useEffect(() => {
    return () => {
      log(id, "router dispose")
      props.router?.dispose()
    }
  }, [])

  /**
   * Handle history
   */
  const _prevCtx = useRef<RouteContext>(null)
  const handleHistory = async ({ location }): Promise<void> => {
    // Update counters
    if (IS_ROOT_ROUTER) {
      ROUTERS.routeCounter++
      ROUTERS.isFirstRoute = ROUTERS.routeCounter === 1
    }

    // Get matching context
    const ctx = props.router.matchRoute(location.pathname + location.search + location.hash)

    if (!ctx) {
      log(id, "no route context found, return.")
      return
    }

    // Select parent context if exist recursively
    let context: RouteContext = ctx
    while (context.parent) {
      context = context.parent
    }

    log(id, "context", context)

    // check if this is the same route 'relative pathname', and if true, return
    // This step allows to avoid the rerender of parent router instances if we visit a nested route
    const prevRelativePathname = _prevCtx.current?.relativePathname
    const currentRelativePathname = context.relativePathname
    log(id, "relative pathnames", {
      prev: prevRelativePathname,
      current: currentRelativePathname,
    })

    if (prevRelativePathname === currentRelativePathname) {
      log(id, "Same relativePathname, return.")
      return
    }

    // get cache object from STORE
    const cache = useCache(ROUTERS.staticPropsCache, id)

    // the matcher will match even if the URL ends with a slash
    let url = composeUrlByRouteName(context.route?.name, context.params)

    // Request & cache static props
    const _requestAndCacheStaticProps = async (
      route: Route,
      cache: CacheAPI,
      url: string
    ): Promise<void> => {
      try {
        const request = await route.getStaticProps(route.props, ROUTERS.i18n?.currentLocale)
        route.props = safeMergeObjects(route.props, request)
        cache.set(url, request)
      } catch (e) {
        console.error(id, "requestStaticProps failed", e)
      }
    }

    // SERVER (first route)
    if (IS_SERVER) {
      if (ROUTERS.initialStaticProps) {
        log(id, "[firstRoute | isServer] assign initialStaticProps to route.props & set cache")
        context.route.props = safeMergeObjects(
          context.route.props,
          ROUTERS.initialStaticProps?.[url]
        )
        cache.set(url, context.route.props)
      }
    }
    // CLIENT
    else {
      // CLIENT > FIRST ROUTE
      if (ROUTERS.isFirstRoute) {
        if (ROUTERS.initialStaticProps?.[url]) {
          log(id, "[firstRoute | isClient] assign initialStaticProps to route.props & set cache")
          context.route.props = safeMergeObjects(
            context.route.props,
            ROUTERS.initialStaticProps?.[url]
          )
          cache.set(url, context.route.props)
        } else if (context.route.getStaticProps) {
          log(id, "[firstRoute | isClient] request getStaticProps & set cache")
          await _requestAndCacheStaticProps(context.route, cache, url)
        }
      }
      // CLIENT > NOT FIRST ROUTE
      else {
        const cacheData = cache.get(url)
        if (cacheData) {
          log(id, "[not firstRoute | isClient] assign existing cache to route.props", cacheData)
          context.route.props = safeMergeObjects(context.route.props, cacheData)
        } else if (context.route.getStaticProps) {
          log(id, "[not firstRoute | isClient] request getStaticProps & set cache")
          await _requestAndCacheStaticProps(context.route, cache, url)
        }
      }
    }

    // add route id to context & dispatch to the router context
    context.routeId = routeId++
    dispatch({ type: "update", currentContext: context })
    ROUTERS.currentContext = context
    _prevCtx.current = context
  }

  /**
   * SERVER SIDE
   * Static location will dispatch route once on server side
   * Need to memo witch has no persistent state across different requests on the server
   */
  const firstHandleHistory = useRef(true)
  if (IS_SERVER && ROUTERS.staticLocation && firstHandleHistory.current) {
    firstHandleHistory.current = false
    const { pathname, search, hash } = new URL(`https://a${ROUTERS.staticLocation}`)
    handleHistory({ location: { pathname, search, hash } })
  }

  /**
   * CLIENT SIDE
   * handle the history on first render & on history change
   */
  useEffect(() => {
    handleHistory({ location: window.location })
    return ROUTERS.history?.listen(handleHistory)
  }, [])

  return (
    <RouterContext.Provider
      children={props.children}
      value={{
        router: props.router,
        base: props.router.options.base,
        routes: props.router.routes,
        options: props.router.options,
        history: ROUTERS.history,
        prevContext: state.prevContext,
        currentContext: state.currentContext,
        counter: state.counter,
        staticLocation: ROUTERS.staticLocation,
        i18n: ROUTERS.i18n,
      }}
    />
  )
}

const Router = memo(LowReactRouter)
export { Router }
