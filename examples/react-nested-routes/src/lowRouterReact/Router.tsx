import { createContext, ReactElement, useEffect, useMemo, useRef, useState } from "react"
import {
  Router as LowRouter,
  Route,
  RouterOptions,
  RouteContext,
  HistoryAPI,
} from "@wbe/low-router"

/**
 * Create context
 */
export interface ILowRouterContextValue {
  routeContext: RouteContext
  router: LowRouter
  routes: Route[]
  options: Partial<RouterOptions>
  history: HistoryAPI | any
}

export const LowRouterContext = createContext<ILowRouterContextValue>({
  routeContext: null,
  router: null,
  routes: null,
  options: null,
  history: null,
})

/**
 * Global routers store
 */
interface Store {
  history: HistoryAPI | any
}
const STORE: Store = {
  history: null,
}

/**
 * Single router instance
 */
export function Router(props: {
  routes: Route[]
  options: Partial<RouterOptions>
  children?: ReactElement
  history?: HistoryAPI
}) {
  if (!STORE.history) STORE.history = props.history

  const [routeContext, setRouteContext] = useState<RouteContext>(null)

  const router = useMemo(() => {
    return new LowRouter(props.routes, {
      ...props.options,
      onResolve: (context, response) => {
        if (routeContext?.pathname === context.pathname) {
          console.log(props.options.id, "same pathname, return")
          return
        }
        setRouteContext(context)
      },
    })
  }, [])

  useEffect(() => {
    return () => {
      console.log("unmount", props.options.id)
      router.dispose()
    }
  }, [])

  useEffect(() => {
    if (!STORE.history) return

    const handleHistory = (location): void => {
      router.resolve(location.pathname + location.search + location.hash)
    }
    // first call to resolve the current location
    handleHistory({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    })
    // listen to history and return the unlisten function
    return STORE.history?.listen(handleHistory)
  }, [STORE.history, router])

  return (
    <LowRouterContext.Provider
      children={props.children}
      value={{
        router,
        routes: props.routes,
        options: props.options,
        history: STORE.history,
        routeContext,
      }}
    />
  )
}
