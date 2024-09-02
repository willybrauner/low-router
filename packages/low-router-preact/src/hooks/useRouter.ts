import { useContext } from "../deps"
import { IRouterContext, RouterContext } from "../components/Router"

export const useRouter = (): IRouterContext => useContext(RouterContext)
