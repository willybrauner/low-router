import { useContext } from "preact/compat"
import { IRouterContext, RouterContext } from "../components/Router"

export const useRouter = (): IRouterContext => useContext(RouterContext)
