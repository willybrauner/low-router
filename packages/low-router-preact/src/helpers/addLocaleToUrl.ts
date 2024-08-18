import { joinPaths } from "./joinPaths"
import { ROUTERS } from "../components/Router"

/**
 * if locale service exist, set lang key to URL
 * and current locale in URL
 *
 * ex
 * before: "/foo"
 * after:  "/en/foo"
 *
 */
export function addLocaleToUrl(
  url: string,
  base: string = ROUTERS.base,
  code: string = ROUTERS?.i18n.currentLocale.code,
  enable = ROUTERS.i18n.showLocaleInUrl()
): string {
  if (!enable) return url
  if (url.startsWith(base)) url = url.replace(base, "")
  url = joinPaths([base, `/${code}`, url === "/" ? "" : `/${url}`])
  return url
}
