import { useRouter } from "./useRouter.tsx"
import { useEffect, useLayoutEffect, useState } from "react"

export function Stack() {
  const {
    routeContext,
    options: { id },
  } = useRouter()

  const [Component, setComponent] = useState(null)

  useLayoutEffect(() => {
    if (!routeContext) return
    setComponent(routeContext?.parent?.route?.action?.() || routeContext?.route.action?.())
  }, [routeContext])

  return <div className={"Stack"}>{Component}</div>
}
