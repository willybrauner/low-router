import {
  Suspense,
  createElement,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from "preact/compat"
import { RouteContext } from "@wbe/low-router"
import { isServer } from "@wbe/utils"
import { useRouter } from "../hooks/useRouter"
// import debug from "@wbe/debug"
// const log = debug("low-router-preact:Stack")

export interface RouteRef {
  playIn: () => Promise<void>
  playOut: () => Promise<void>
  root: HTMLElement
  name: string
  routeId?: number
}

export interface StackTransitionsParams {
  prev: RouteRef
  current: RouteRef
  unmountPrev: () => void
}

interface Props {
  // Pass a custom transitions function
  transitions?: (T: StackTransitionsParams) => Promise<void>
  // Clamp Routes render number to two routes, prev & next
  clampRoutesRender?: boolean
  // HTML tag to render as wrapper element (default: "div")
  as?: string
  // CSS class name for the wrapper element
  className?: string
}

/**
 * Default transitions function used if there is no custom transitions fn passed as props
 */
const DEFAULT_TRANSITION = async ({ prev, current, unmountPrev }: StackTransitionsParams) => {
  if (current?.root) current.root.style.opacity = "0"
  if (prev?.playOut) {
    await prev.playOut?.()
    unmountPrev()
  }
  if (current?.playIn) {
    await current?.playIn?.()
    if (current?.root) current.root.style.opacity = "1"
  }
}

/**
 * Stack
 * @param transitions
 * @param clampRoutesRender
 */
export function Stack({ transitions, clampRoutesRender = true, as = "div", className }: Props) {
  const { prevContext, currentContext } = useRouter()
  // Allow null entries for lazy components whose ref is not yet attached
  const routeRefs = useRef<(RouteRef | null)[]>([])

  // Stores a deferred transition callback when the current route ref is null
  // (lazy component not yet resolved). Consumed by the ref callback once it mounts.
  const pendingTransitionRef = useRef<((current: RouteRef) => void) | null>(null)

  /**
   * Reducer state
   */
  const [state, dispatch] = useReducer(
    (
      state,
      action: {
        type: "update" | "unmount-prev"
        prevContext?: RouteContext
        currentContext?: RouteContext
        routeIdToRemove?: number
      },
    ) => {
      switch (action.type) {
        case "update":
          const newStates = {
            currentContext: action.prevContext as RouteContext,
            prevContext: action.prevContext as RouteContext,
            updateId: state.updateId + 1,
            stackRoutes: [...state.stackRoutes, action.currentContext]
              .filter(Boolean)
              .slice(clampRoutesRender ? -2 : 0) as RouteContext[],
          }
          // log(id, "update", newStates)
          return newStates

        case "unmount-prev":
          const stackRoutes = state.stackRoutes?.filter(
            (e) => e?.routeId !== action.routeIdToRemove,
          )
          // log(id, "stackRoutes after remove", stackRoutes)
          return {
            ...state,
            stackRoutes,
          }
      }
    },
    {
      stackRoutes: [] as RouteContext[],
      currentContext,
      prevContext,
      updateId: 0,
    },
  )

  /**
   * SERVER SIDE
   * Called dispatch on the server using memo instead of
   */
  useMemo(() => {
    if (isServer()) {
      dispatch({ type: "update", prevContext, currentContext })
    }
  }, [])
  /**
   * CLIENT SIDE
   * Update stack routes list when currentContext change
   */
  useLayoutEffect(() => {
    if (!currentContext) return
    dispatch({ type: "update", prevContext, currentContext })
  }, [prevContext, currentContext])

  /**
   * Execute transitions function after dispatch
   */
  useLayoutEffect(() => {
    if (state.stackRoutes?.length === 0) return
    // Cancel any stale pending transition from a previous navigation
    pendingTransitionRef.current = null
    const prev = routeRefs.current?.[state.stackRoutes?.length - 2]
    const current = routeRefs.current?.[state.stackRoutes?.length - 1]

    // Unmount previous route
    const unmountPrev = (): void => {
      dispatch({ type: "unmount-prev", routeIdToRemove: prev?.routeId })
    }

    const runTransition = (resolvedCurrent: RouteRef): void => {
      // execute custom transitions function if passed as props
      ;(transitions || DEFAULT_TRANSITION)({
        unmountPrev,
        prev: prev as RouteRef,
        current: resolvedCurrent,
      })
    }
  
    // Check if the current route has an action (renders a component)
    const currentRouteContext = state.stackRoutes?.[state.stackRoutes?.length - 1]
    const currentRouteHasAction = !!currentRouteContext?.route?.action

    if (current) {
      // non-lazy: ref is already attached, run immediately
      runTransition(current)
    } else if (!currentRouteHasAction) {
      // Route has no action (no component to render), run transition immediately
      // so that the previous route can still play out
      runTransition(null as RouteRef)
    } else {
      // lazy: ref not yet attached, defer until the ref callback fires
      pendingTransitionRef.current = runTransition
    }
  }, [state.updateId])

  return createElement(
    as,
    { className },
    state.stackRoutes?.map((context, i) => {
      const Route = context.route.action?.()
      if (!Route) return null
      const routeId = context.routeId
      return createElement(
        Suspense,
        { fallback: null, key: routeId },
        createElement(Route, {
          ref: (e: RouteRef) => {
            routeRefs.current[i] = e ? { ...e, routeId } : null

            // if this is the current route and a transition is waiting for its ref, execute it
            if (e && i === state.stackRoutes.length - 1 && pendingTransitionRef.current) {
              pendingTransitionRef.current({ ...e, routeId })
              pendingTransitionRef.current = null
            }
          },
          params: context.params,
          query: context.query,
          hash: context.hash,
          ...(context.route.props || {}),
        }),
      )
    }),
  )
}
