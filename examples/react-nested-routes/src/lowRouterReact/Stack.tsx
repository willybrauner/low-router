import { useRouter } from "./useRouter.tsx"
import { useEffect } from "react"

export function Stack() {
  const { routeContext } = useRouter()

  const Component = routeContext?.parent?.action?.() ?? routeContext?.route?.action?.()

  console.log("Component", Component)

  // useEffect(() => {
  //   console.log("routeContext", routeContext)
  // }, [routeContext])

  return <div className={"Stack"}>{Component}</div>
}
