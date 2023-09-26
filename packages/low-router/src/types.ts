import { RegexFn } from "./createMatcher"
import { Router } from "./Router"

export type RouteParams = { [paramName: string]: string }
export type QueryParams = { [paramName: string]: string }
export type Hash = string
export type RouteProps = Record<string, any>
export type ActionResponse<A> = Promise<A> | A

export interface RouteContext<A = any, P = RouteProps | any> {
  pathname: string
  params: RouteParams
  query: QueryParams
  hash: Hash
  base: string
  route: Route<A, P>
  parent?: Route<A, P>
}

export interface Route<A = any, P = any> {
  path: string
  name?: string
  props?: P
  children?: Route<A, P>[] | null
  parent?: Route<A, P> | null
  action?: (context?: RouteContext<A, P>) => ActionResponse<A>
}

export interface RouterOptions<A = any, P = any> {
  base: string
  onInit: () => void
  onResolve: (context: RouteContext<A, P>, actionResponse: ActionResponse<A>) => void
  onDispose: () => void
  onError: () => void
  pathToRegexFn: RegexFn
  debug: boolean
  plugins: RouterPlugin[]
  id?: number | string
}

export interface RouterPluginHooks {
  name: string
  onInit?: () => void
  beforeResolve?: (context: RouteContext) => void
  onResolve?: (context: RouteContext) => void
  onDispose?: () => void
  onError?: () => void
}

export type RouterPlugin = (router: Router) => RouterPluginHooks
