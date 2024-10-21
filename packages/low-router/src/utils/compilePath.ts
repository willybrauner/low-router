import { RouteParams } from "../types"

/**
 * Compile path
 * Naive implementation of "compile" path-to-regexp function
 *
 * ex:
 *  compilePath("/foo/:id")({id: "bar"}) -> /foo/bar
 *  compilePath("/foo/:id?")({id: "bar"}) -> /foo/bar
 *  compilePath("/foo?param=one")({id: "bar"}) -> /foo?param=one
 * @param path
 * @param options
 */

export function compilePath(path: string, options?: {}): (params: RouteParams) => string {
  return (params): string => {
    const [pathWithoutHash, hash] = path.split("#")
    const query = /\?(?!\/).+$/.exec(pathWithoutHash)?.[0]
    const pathWithoutQuery = pathWithoutHash.replace(query, "")
    const s = pathWithoutQuery
      .replace(/:([^/?]+)(\?)?/g, (match, key) => params?.[key] ?? "")
      .replace(/(\/)+/g, "/")
    return (
      (s.endsWith("/") && s !== "/" ? s.slice(0, -1) : s) +
      (query ? `${query}` : "") +
      (hash ? `#${hash}` : "")
    )
  }
}
