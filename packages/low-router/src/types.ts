import { Matcher } from "./createMatcher"

export type RouteParams = { [paramName: string]: string }
export type QueryParams = { [paramName: string]: string }
export type Hash = string
export type RouteProps = Record<string, any>
export type ActionResponse<A> = Promise<A> | A
export type PathnameOrObject = string | { name: string; params: RouteParams }

export interface RouterContext {
  [prop: string]: any
}

export interface RouteContext<A = any, C extends RouterContext = RouterContext> {
  pathname: string
  params: RouteParams
  query: QueryParams
  hash: Hash
  base: string
  route: Route<A, C>
  parent: RouteContext<A, C> | null
}

export interface Resolve<A, C> {
  response: ActionResponse<A>
  context: RouteContext<A, C>
}

export interface Route<A = any, C extends RouterContext = RouterContext> {
  path: string
  name?: string
  props?: RouteProps
  children?: Route<A, C>[] | null | undefined
  action?: (context?: RouteContext<A, C>) => ActionResponse<A>
}

export interface RouterOptions<A = any, C extends RouterContext = RouterContext> {
  base: string
  onInit: () => void
  onResolve: ({ response, context }: Resolve<A, C>) => void
  onDispose: () => void
  onError: () => void
  matcher: Matcher
  id?: number | string
}
