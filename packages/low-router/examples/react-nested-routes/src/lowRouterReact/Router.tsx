import { createContext, memo, ReactElement, useEffect, useMemo, useState } from "react"
import { LowRouter, Route, RouterOptions, RouteContext, HistoryAPI } from "@wbe/low-router"

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

const STORE = {
  history: null,
}

/**
 * Single router instance
 */
function LowReactRouter(props: {
  routes: Route[]
  options: Partial<RouterOptions>
  children?: ReactElement
  history?: HistoryAPI | any
  staticLocation?: string
}) {
  if (!STORE.history) STORE.history = props.history
  const [routeContext, setRouteContext] = useState<RouteContext>(null)

  const router = useMemo(
    () =>
      new LowRouter(props.routes, {
        ...props.options,
        onResolve: ({ response, context }) => {
          while (context) {
            if (!context.parent) break
            context = context.parent
          }
          setRouteContext(context)
        },
      }),
    []
  )

  useEffect(() => {
    return () => {
      console.log("unmount", props.options.id)
      router.dispose()
    }
  }, [])

  useEffect(() => {
    if (props?.staticLocation) {
      router.resolve(props.staticLocation)
      return
    }

    if (!STORE.history || !router) return

    const handleHistory = ({ location, action }: { location; action? }): void => {
      // console.log(props.options.id, "handleHistory", location)
      router.resolve(location.pathname + location.search + location.hash)
    }
    // first call to resolve the current location
    handleHistory({
      location: {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
    })

    // listen to history and return the unlisten function
    return STORE.history?.listen(handleHistory)
  }, [props?.staticLocation, STORE.history])

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

const Router = memo(LowReactRouter)
export { Router }
