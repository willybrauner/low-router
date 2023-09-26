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
    console.log(id, "---- parent route action", routeContext?.parent?.route?.action?.())
    console.log(id, "---- route action", routeContext?.route.action?.())

    setComponent(routeContext?.parent?.route?.action?.() || routeContext?.route?.action?.())
  }, [routeContext])

  return <div className={"Stack"}>{Component}</div>
}
