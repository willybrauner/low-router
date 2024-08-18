import { LowRouter, RouteContext } from "@wbe/low-router"
import debug from "@wbe/debug"
import { I18n, composeUrlByRouteName } from ".."

export type InitialStaticProps = Record<string, Record<string, any>>

const log = debug("router:staticProps")
/**
 * get static props from url
 *
 *  - create a router instance
 *  - resolve the url
 *  - request getStaticProps from the route
 *
 * @param url
 * @param router
 * @param i18n
 */
export async function getStaticPropsFromUrl(
  url: string,
  router: LowRouter,
  i18n?: I18n
): Promise<InitialStaticProps> {
  // need to resolve the final route
  let resolve
  try {
    resolve = await router.resolve(url)
  } catch (e) {
    log("resolve error", e)
    return
  }

  const context = resolve?.context
  if (!context) {
    log("No context, return")
    return
  }

  const initialStaticProps: InitialStaticProps = {}
  /**
   * Parse the route three from the end to the beginning
   * Check if each route level as static props and keep it, when go to the parent route recursively
   * @param context
   */
  const recursive = async (context: RouteContext): Promise<InitialStaticProps> => {
    const { route } = context
    if (route.getStaticProps) {
      try {
        const data = await route.getStaticProps(route.props, i18n?.currentLocale)
        const url = composeUrlByRouteName(route?.name, context.params)
        initialStaticProps[url] = data
      } catch (e) {
        log("fetch getStaticProps data error", e)
      }
    }

    if (context.parent) {
      return recursive(context.parent)
    }

    return initialStaticProps
  }
  return await recursive(context)
}
