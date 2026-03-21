import { RouteParams } from "../types"

export type CompilePath = (path: string) => (params: RouteParams) => string

/**
 * Compile path
 * Naive implementation of "compile" path-to-regexp function
 *
 * ex:
 *  compilePath("/foo/:id", {id: "bar"}) -> /foo/bar
 *  compilePath("/foo/:id?", {id: "bar"}) -> /foo/bar
 *  compilePath("/foo?param=one", {id: "bar"}) -> /foo?param=one
 * @param path
 */

export const compilePath: CompilePath = (path) => {
  return (params) => {
    const [pathWithoutHash, hash] = path.split("#")
    const query = /\?(?!\/).+$/.exec(pathWithoutHash)?.[0]
    const pathWithoutQuery = pathWithoutHash.replace(query, "")
    const s = pathWithoutQuery
      .replace(/:([A-Za-z0-9_]+)([?+*]?)/g, (_, key) => params?.[key] ?? "")
      .replace(/(\/)+/g, "/")
    return (
      (s.endsWith("/") && s !== "/" ? s.slice(0, -1) : s) +
      (query ? `${query}` : "") +
      (hash ? `#${hash}` : "")
    )
  }
}
