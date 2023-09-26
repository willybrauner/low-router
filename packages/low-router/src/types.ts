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
  parent: RouteContext<A, P> | null
  // _path: string
}

export interface Route<A = any, P = any> {
  path: string
  name?: string
  props?: P
  children?: Route<A, P>[] | null
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
  id?: number | string
}
