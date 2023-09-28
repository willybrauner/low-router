import { useContext } from "react"
import { ILowRouterContextValue, LowRouterContext } from "./Router.tsx"

export function useRouter(): ILowRouterContextValue {
  return useContext(LowRouterContext)
}
