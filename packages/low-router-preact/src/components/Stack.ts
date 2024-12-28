import { useRef, createElement, useMemo, useReducer, useLayoutEffect } from "../preact-deps"
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
      },
    ) => {
      switch (action.type) {
        case "update":
          const newStates = {
            currentContext: action.prevContext,
            prevContext: action.prevContext,
            updateId: state.updateId + 1,
            stackRoutes: [...state.stackRoutes, action.currentContext]
              .filter(Boolean)
              .slice(clampRoutesRender ? -2 : 0),
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
      stackRoutes: [],
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
    const prev = routeRefs.current?.[state.stackRoutes?.length - 2]
    const current = routeRefs.current?.[state.stackRoutes?.length - 1]

    // Unmount previous route
    const unmountPrev = (): void => {
      dispatch({ type: "unmount-prev", routeIdToRemove: prev?.routeId })
    }

    // execute custom transitions function if passed as props
    ;(transitions || DEFAULT_TRANSITION)({
      unmountPrev,
      prev,
      current,
    })
  }, [state.updateId])

  return createElement(
    "div",
    { className: "Stack" },
    state.stackRoutes?.map((context, i) => {
      const Route = context.route.action?.()
      if (!Route) return null
      const routeId = context.routeId
      return createElement(Route, {
        ref: (e: RouteRef) => {
          routeRefs.current[i] = { ...e, routeId } as RouteRef
        },
        key: routeId,
        params: context.params,
        query: context.query,
        hash: context.hash,
        ...(context.route.props || {}),
      })
    }),
  )
}
