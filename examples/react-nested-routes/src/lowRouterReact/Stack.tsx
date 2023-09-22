import { useRouter } from "./useRouter.tsx"
import { useEffect } from "react"

export function Stack() {
  const { actionResponse, options } = useRouter()

  useEffect(() => {
    console.log(options.id, "Stack response", actionResponse)
  }, [actionResponse])

  return <div className={"Stack"}>{actionResponse}</div>
}
