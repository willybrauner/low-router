import { useRouter } from "./useRouter.tsx"
import { useEffect, useState } from "react"

export function Stack() {
  const { routeContext } = useRouter()

  const [Component, setComponent] = useState(null)
  useEffect(() => {
    const C = routeContext?.parent?.action?.() ?? routeContext?.route?.action?.()
    setComponent(C)
    console.log("Component", C)
  }, [routeContext])

  // useEffect(() => {
  //   console.log("routeContext", routeContext)
  // }, [routeContext])

  return <div className={"Stack"}>{Component}</div>
}
