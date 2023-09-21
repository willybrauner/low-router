import { RegexFn } from "./createMatcher"
import { HistoryEvents } from "./historyPlugin"
import { Router } from "./Router"

export type RouteParams = { [paramName: string]: string }
export type QueryParams = { [paramName: string]: string }
export type Hash = string
export type RouteProps = Record<string, any>
export type ActionResponse<A> = Promise<A> | A

export interface RouteContext<A = any, P = RouteProps> {
  pathname: string
  params: RouteParams
  query: QueryParams
  hash: Hash
  base: string
  route: Route<A, P>
  parent?: Route<A, P>
}

export interface Route<A, P> {
  path: string
  name?: string
  props?: P
  children?: Route<A, P>[] | null
  parent?: Route<A, P> | null
  action?: (context?: RouteContext<A, P>) => ActionResponse<A>
}

export interface RouterOptions<A, P> {
  base: string
  onInit: () => void
  onResolve: (context: RouteContext<A, P>, actionResponse: ActionResponse<A>) => void
  onPause: (context: RouteContext<A, P>) => void
  onError: () => void
  pathToRegexFn: RegexFn
  debug: boolean
  plugins: RouterPlugin[]
}

export interface RouterPluginHooks {
  onInit?: () => void
  onBeforeResolve?: (context: RouteContext, eventType: HistoryEvents) => void
  onResolve?: (context: RouteContext, eventType: HistoryEvents) => void
  onPause?: (context: RouteContext) => void
  onError?: () => void
}

export type RouterPlugin = (router: Router) => RouterPluginHooks
