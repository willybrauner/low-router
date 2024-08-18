import { IRouterContext, RouterContext } from ".."
import { useContext } from "preact/compat"

export const useRouter = (): IRouterContext => useContext(RouterContext)
