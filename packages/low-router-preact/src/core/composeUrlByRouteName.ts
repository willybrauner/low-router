import { compilePath, Route, RouteParams } from "@wbe/low-router"
import { ROUTERS } from "../components/Router"

/**
 * return a compile pathname (or url) by route name
 * ex:
 *      /base/fr/path-fr/ -> /base/en/path-en/
 *     const composedUrl = composeUrlByRouteName(routeContext.route?.name, { lang: toLocale.key })
 *
 * @param name
 * @param params
 * @param routes
 * @param base
 * @param i18n
 */

export function composeUrlByRouteName(
  name: string,
  params: RouteParams,
  routes = ROUTERS.routes,
  i18n = ROUTERS.i18n,
  base = ROUTERS.base
): string {
  if (!name) {
    console.error("composeUrlByRouteName > name is invalid, return", name)
    return
  }
  // prettier-ignore
  const next = (routes: Route[], params: RouteParams, curBase: string): string => {
    for (let route of routes) {
      const lang = params?.lang || params?.code || i18n?.currentLocale.code
      const selectPath = route.translations?.[lang] || route.path
      const compiledPath = compilePath(curBase + selectPath)(params)
      if (route?.name === name) {
        return compiledPath
      }
      else if (route.children?.length > 0) {
        const match = next(route.children, params, compiledPath)
        if (match) {
          return match
        }
      }
    }
  }
  return next(routes, params, base)
}
