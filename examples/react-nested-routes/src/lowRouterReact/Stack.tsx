import { useRouter } from "./useRouter.tsx"
import { useEffect, useState } from "react"

export function Stack() {
  const { routeContext } = useRouter()

  const [Component, setComponent] = useState(null)

  useEffect(() => {
    setComponent(routeContext?.parent?.route.action?.() || routeContext?.route?.action?.())
  }, [routeContext])

  return <div className={"Stack"}>{Component}</div>
}
