import { h } from 'preact'
import { useLayoutEffect, useMemo, useReducer } from "preact/compat"
import { useRef } from "preact/hooks"
import debug from "@wbe/debug"
import { RouteContext } from "@wbe/low-router"
import { isServer } from "@wbe/utils"
import { useRouter } from ".."

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
  if (current?.playIn) await current?.playIn?.()
}

const log = debug("low-router:Stack")

/**
 * Stack
 * @param transitions
 * @param clampRoutesRender
 */
export function Stack({ transitions, clampRoutesRender = true }: Props) {
  const {
    options: { id },
    prevContext,
    currentContext,
  } = useRouter()
  const routeRefs = useRef<RouteRef[]>([])

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
      }
    ) => {
      switch (action.type) {
        case "update":
          const newStackRoutes = clampRoutesRender
            ? [action.prevContext, action.currentContext].filter(Boolean)
            : [...state.stackRoutes, action.currentContext].filter(Boolean)
          // log(id, "stackRoutes", newStackRoutes)
          return {
            prevContext: action.prevContext,
            currentContext: action.prevContext,
            stackRoutes: newStackRoutes,
          }
        case "unmount-prev":
          const stackRoutes = state.stackRoutes?.filter(
            (e) => e?.routeId !== action.routeIdToRemove
          )
          // log(id, "stackRoutes after remove", stackRoutes)
          return {
            ...state,
            stackRoutes,
          }
      }
    },
    {
      stackRoutes: [],
      routeIdToRemove: null,
      currentContext,
      prevContext,
    }
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
    const prev = routeRefs.current?.[state.stackRoutes?.length - 2]
    const current = routeRefs.current?.[state.stackRoutes?.length - 1]
    const unmountPrev = () => {
      dispatch({ type: "unmount-prev", routeIdToRemove: prev?.routeId })
    }
    ;(transitions || DEFAULT_TRANSITION)({
      unmountPrev,
      prev,
      current,
    })
  }, [state.stackRoutes])

  return (
    <div className={"Stack"}>
      {state.stackRoutes?.map((context, i) => {
        const Route = context.route.action?.()
        if (!Route) return
        const routeId = context.routeId
        return (
          <Route
            // https://react.dev/blog/2024/04/25/react-19#cleanup-functions-for-refs
            ref={(e) => {
              routeRefs.current[i] = { ...e, routeId } as RouteRef
            }}
            key={routeId}
            params={context.params}
            query={context.query}
            hash={context.hash}
            {...(context.route.props || {})}
          />
        )
      })}
    </div>
  )
}
