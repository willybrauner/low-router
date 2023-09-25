import { useRouter } from "./useRouter.tsx"

export function Stack() {
  const { actionResponse } = useRouter()
  return <div className={"Stack"}>{actionResponse}</div>
}
