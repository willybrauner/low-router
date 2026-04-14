import { Matcher } from "./utils/createMatcher"
import { CompilePath } from "./utils/compilePath"

export type RouteParams = { [paramName: string]: string }
export type QueryParams = { [paramName: string]: string }
export type Hash = string
export type RouteProps = Record<string, any>
export type PathnameOrObject =
  | string
  | { name: string; params?: RouteParams; query?: QueryParams; hash?: string }

export interface RouteContext {
  pathname: string
  params: RouteParams
  query: QueryParams
  hash: Hash
  base: string
  route: Route
  parent: RouteContext | null
  relativePathname: string
}

export interface Resolve {
  response: any
  context: RouteContext | undefined
}

export interface Route {
  path: string
  name?: string
  props?: RouteProps
  children?: Route[] | null | undefined
  action?: (context?: RouteContext) => any
}

export interface RouterOptions {
  base: string
  onInit: () => void
  onResolve: ({ response, context }: Resolve) => void
  onDispose: () => void
  onError: () => void
  matcher: Matcher
  compilePath: CompilePath
  id?: number | string
}
