import { useRouter } from "./useRouter.tsx"
import { useEffect, useState } from "react"

export function Stack() {
  const {
    routeContext,
    options: { id },
  } = useRouter()

  const [Component, setComponent] = useState(null)

  useEffect(() => {
    if (!routeContext) return

    let ctx = routeContext
    let action = null

    while (ctx) {
      if (ctx?.route?.action) action = ctx.route.action()
      ctx = ctx.parent
    }
    if (action) setComponent(action)

  }, [routeContext])

  useEffect(() => {
    if (!routeContext) return
    console.log(
      id,
      "---- parent parent route action",
      routeContext?.parent?.parent?.route?.action?.()
    )
    console.log(id, "---- parent route action", routeContext?.parent?.route?.action?.())
    console.log(id, "---- route action", routeContext?.route.action?.())
  }, [routeContext])

  return <div className={"Stack"}>{Component}</div>
}
