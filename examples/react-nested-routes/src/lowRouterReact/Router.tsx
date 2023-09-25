import { createContext, ReactElement, useEffect, useMemo, useRef, useState } from "react"
import { Route, RouterOptions, Router as LowRouter, RouteContext } from "@wbe/low-router"
import { useRouter } from "./useRouter.tsx"
import { beeper } from "../beeper.ts"

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

const onRouteResolveBeeper = beeper()

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
  //  const [prevRouteContext, setPrevRouteContext] = useState<RouteContext>(null)
  const routeContextRef = useRef<RouteContext>()
  const [actionResponse, setActionResponse] = useState<any>(null)

  const router = useMemo(() => {
    return new LowRouter(props.routes, {
      ...props.options,
      onResolve: (context, actionResponse) => {
        console.log(props.options.id, "routeContextRef pathname", routeContextRef.current?.pathname)
        console.log(props.options.id, "context.pathname", context.pathname)
        if (routeContextRef.current?.pathname === context.pathname) {
          console.log(props.options.id, "same pathname, return")
          return
        }
        routeContextRef.current = context
        if (context.parent?.action) setActionResponse(context.parent.action())
        else setActionResponse(actionResponse)
      },
    })
  }, [])

  useEffect(() => {
    return () => {
      console.log("unmount", props.options.id)
      router.dispose()
    }
  }, [])

  // useEffect(() => {
  //   return onRouteResolveBeeper.on(({ context, actionResponse }) => {
  //
  //   })
  // }, [actionResponse])

  return (
    <LowRouterContext.Provider
      value={{
        router,
        routeContext: routeContextRef.current,
        actionResponse,
        routes: props.routes,
        options: props.options,
      }}
    >
      {props.children}
    </LowRouterContext.Provider>
  )
}
