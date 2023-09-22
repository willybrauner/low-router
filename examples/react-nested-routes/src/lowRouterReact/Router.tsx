import { createContext, ReactElement, useMemo, useState } from "react"
import { Route, RouterOptions, Router as LowRouter, RouteContext } from "@wbe/low-router"

export interface ILowRouterContext {
  routeContext: RouteContext
  actionResponse: any
  router: LowRouter
  routes: Route[]
  options: Partial<RouterOptions>
}
export const LowRouterContext = createContext<ILowRouterContext>({
  routeContext: null,
  actionResponse: null,
  router: null,
  routes: null,
  options: null,
})

/**
 *
 *
 *
 */
export function Router(props: {
  routes: Route[]
  options: Partial<RouterOptions>
  children?: ReactElement
}) {
  const [prevRouteContext, setPrevRouteContext] = useState<RouteContext>(null)
  const [routeContext, setRouteContext] = useState<RouteContext>(null)
  const [actionResponse, setActionResponse] = useState<any>(null)

  const [url, setUrl] = useState(null)

  const router = useMemo(() => {
    return new LowRouter(props.routes, {
      ...props.options,
      onResolve: (context, actionResponse) => {
        // if (url === context?.pathname) {
        //   console.log(props.options.id, "url === context?.pathname", url, context?.pathname)
        //   return
        // }
        // setUrl(context?.pathname)

        if (routeContext) setPrevRouteContext(routeContext)

        //        if (context.parent.path === window.location?.pathname) return
        console.log(props.options.id, "----context", context)
        setRouteContext(context)

        console.log("context.parent", context.parent, context)
        if (context.parent?.action) {
          const res = context.parent.action()
          setActionResponse(res)
        } else {
          setActionResponse(actionResponse)
        }
      },
    })
  }, [props])

  return (
    <LowRouterContext.Provider
      value={{
        router,
        routeContext,
        actionResponse,
        routes: props.routes,
        options: props.options,
      }}
    >
      {props.children}
    </LowRouterContext.Provider>
  )
}
