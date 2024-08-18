import { normalizePath, RouteParams } from "@wbe/low-router"
import { addLocaleToUrl, composeUrlByRouteName, joinPaths, ROUTERS } from ".."

export function setLocation(
  to: string | { name: string; params?: RouteParams },
  i18n = ROUTERS.i18n,
  base = ROUTERS.base,
  history = ROUTERS.history
) {
  let url: string
  if (typeof to === "string") {
    url = normalizePath(joinPaths([base, addLocaleToUrl(to)]))
  }
  if (typeof to === "object") {
    url = composeUrlByRouteName(to.name, {
      code: i18n?.currentLocale?.code,
      ...to.params,
    })
  }

  history?.push(url)
}
