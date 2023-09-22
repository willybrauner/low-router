import { useContext } from "react"
import { ILowRouterContext, LowRouterContext } from "./Router.tsx"

export function useRouter(): ILowRouterContext {
  return useContext(LowRouterContext)
}
