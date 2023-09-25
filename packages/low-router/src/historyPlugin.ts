import { Router } from "./Router"
import { RouterPluginHooks } from "./types"
export type HistoryEvents = "pushState" | "replaceState" | "popstate" | "hashchange"

/**
 * Create browser history
 *
 * TODO check if we need to make it outside of the plugin
 * this is a little bit more code...
 */
const createBrowserHistory = () => {
  const events: HistoryEvents[] = ["pushState", "replaceState", "popstate", "hashchange"]
  const keepPushState = history.pushState
  const keepReplaceState = history.replaceState

  return {
    listen: (cb: (event?) => void) => {
      for (const type of ["pushState", "replaceState"]) {
        const original = history[type]
        history[type] = function () {
          const result = original.apply(this, arguments)
          const event = new Event(type)
          event["arguments"] = arguments
          dispatchEvent(event)
          return result
        }
      }
      for (const event of events) window.addEventListener(event, cb)
      return () => {
        history.pushState = keepPushState
        history.replaceState = keepReplaceState
        for (const event of events) window.removeEventListener(event, cb)
      }
    },
    push: (pathname: string, eventType: HistoryEvents = "pushState") => {
      window.history[eventType]({}, null, pathname)
    },
  }
}

/**
 * History plugin
 * @param router
 */

export function historyPlugin(router: Router): RouterPluginHooks {
  const browserHistory = createBrowserHistory()

  const handleHistory = async (event?): Promise<void> => {
    console.log("handleHistory", event)
    const pathname =
      event?.["arguments"]?.[2] ||
      window.location.pathname + window.location.search + window.location.hash ||
      "/"
    if (!pathname || pathname === router.currentContext?.pathname) return
    router.resolve(pathname, event?.type)
  }

  let unlisten: () => void = null

  return {
    name: "historyPlugin",
    onInit: () => {
      unlisten = browserHistory.listen(handleHistory)
      handleHistory()
    },
    beforeResolve: (context, eventType) => {
      // TODO check if we need to prevent
      if (eventType != "popstate") {
        browserHistory.push(context.pathname, eventType)
      }
    },
    onDispose: () => {
      unlisten()
    },
  }
}
