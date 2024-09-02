import { LowRouter, Route, RouterOptions, RouteContext, HistoryAPI } from "@wbe/low-router"
import {
  useRef,
  createContext,
  createElement,
  memo,
  ReactElement,
  useEffect,
  useReducer,
} from "../deps"

import debug from "@wbe/debug"
import { isServer } from "@wbe/utils"
import { CacheAPI, useCache } from "../core/useCache"
import { safeMergeObjects } from "../helpers/safeMergeObjects"
import { I18n } from "../services/I18n"
import { InitialStaticProps } from "../core/getStaticPropsFromUrl"
import { composeUrlByRouteName } from "../core/composeUrlByRouteName"

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
  prevContext: undefined,
  currentContext: undefined,
  router: undefined,
  base: undefined,
  routes: undefined,
  options: undefined,
  history: undefined,
  counter: 0,
  staticLocation: undefined,
  i18n: undefined,
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

export let ROUTERS: IRouters = {
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

const log = debug("low-router-preact:Router")
const IS_SERVER = isServer()
let ROUTE_ID = 0

// ------------------------------------------------------------------------------------------------- ROUTER

/**
 * LowReactRouter
 * A Single react/preact router instance
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
  const id = props.router.options.id
  const IS_ROOT_ROUTER = !!props.staticLocation || !!props.history

  // reset store values is root-router
  const first = useRef(true)
  if (IS_ROOT_ROUTER && first.current) {
    first.current = false
    ROUTERS = {
      router: props.router,
      base: props.router.options.base,
      routes: props.router.routes,
      history: props.history,
      currentContext: undefined,
      staticLocation: props.staticLocation,
      initialStaticProps: props.initialStaticProps,
      staticPropsCache: {},
      isFirstRoute: true,
      routeCounter: 0,
      i18n: props.i18n,
    }
  }

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
    return () => props.router?.dispose()
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
      log(id, "no context found, return.")
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
    if (_prevCtx.current?.relativePathname === context.relativePathname) {
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
        // log(id, "[firstRoute | isServer] assign initialStaticProps to route.props & set cache")
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
          // log(id, "[firstRoute | isClient] assign initialStaticProps to route.props & set cache")
          context.route.props = safeMergeObjects(
            context.route.props,
            ROUTERS.initialStaticProps?.[url]
          )
          cache.set(url, context.route.props)
        } else if (context.route.getStaticProps) {
          //log(id, "[firstRoute | isClient] request getStaticProps & set cache")
          await _requestAndCacheStaticProps(context.route, cache, url)
        }
      }
      // CLIENT > NOT FIRST ROUTE
      else {
        const cacheData = cache.get(url)
        if (cacheData) {
          // log(id, "[not firstRoute | isClient] assign existing cache to route.props", cacheData)
          context.route.props = safeMergeObjects(context.route.props, cacheData)
        } else if (context.route.getStaticProps) {
          // log(id, "[not firstRoute | isClient] request getStaticProps & set cache")
          await _requestAndCacheStaticProps(context.route, cache, url)
        }
      }
    }

    // add route id to context & dispatch to the router context
    context.routeId = ROUTE_ID++
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
    const { pathname, search } = new URL(`https://a${ROUTERS.staticLocation}`)
    handleHistory({ location: { pathname, search } })
  }

  /**
   * CLIENT SIDE
   * handle the history on first render & on history change
   */
  useEffect(() => {
    handleHistory({ location: window.location })
    return ROUTERS.history?.listen(handleHistory)
  }, [])

  return createElement(RouterContext.Provider, {
    children: props.children,
    value: {
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
    },
  })
}

const Router = memo(LowReactRouter)
export { Router }
