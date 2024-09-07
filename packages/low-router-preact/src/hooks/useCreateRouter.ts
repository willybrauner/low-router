import { useMemo } from "../preact-deps"
import { LowRouter, normalizePath } from "@wbe/low-router"
import { joinPaths } from "../helpers/joinPaths"
import { useRouter } from "./useRouter"

/**
 * Shortcut to create a router instance passed to <Router> component
 * @param from Route name of the component where the router is created
 * @param id Unique id for the router instance
 */
export const useCreateRouter = ({ from, id }: { from: string; id: number | string }): LowRouter => {
  const { routes, base: parentBase, i18n } = useRouter()

  return useMemo<LowRouter>(() => {
    const route = routes.find((e) => e.name === from)
    if (!route) {
      console.error(`Route with name "${from}" not found. Can't create router instance.`)
      return
    }
    const path = route.translations?.[i18n?.currentLocale?.code] || route.path
    const base = normalizePath(joinPaths([parentBase, path]))
    return new LowRouter(route.children, { base, id })
  }, [routes, parentBase, i18n])
}
