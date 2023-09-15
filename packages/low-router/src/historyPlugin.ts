export type HistoryEvents = "pushState" | "replaceState" | "popstate" | "hashchange"
import { Router, RouterPluginHooks } from "./Router"

/**
 * History plugin
 * @param router
 */
export function historyPlugin(router: Router): RouterPluginHooks {
  const h = history
  const w = window
  const events: HistoryEvents[] = ["pushState", "replaceState", "popstate", "hashchange"]
  const keepPushState = h.pushState
  const keepReplaceState = h.replaceState

  // When window.history change
  const handleHistory = async (event): Promise<void> => {
    const pathname = event?.["arguments"]?.[2] || w.location.pathname
    if (!pathname || pathname === router.currentContext?.pathname) return
    await router.resolve(pathname, event?.type)
  }

  return {
    onInit: () => {
      // While History API does have `popstate` event, the only, proper way to listen
      // to changes via `push/replaceState` is to monkey-patch these methods.
      // https://stackoverflow.com/questions/5129386/how-to-detect-when-history-pushstate-and-history-replacestate-are-used
      // https://stackoverflow.com/a/4585031
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
      // listen to events
      for (const event of events) w.addEventListener(event, handleHistory)
      // push initial route
      router.resolve(w.location.pathname + w.location.search + w.location.hash || "/")
    },
    onPause: () => {
      // restore original methods
      h.pushState = keepPushState
      h.replaceState = keepReplaceState
      // remove listeners
      for (const event of events) w.removeEventListener(event, handleHistory)
    },
    onResolve: (context, eventType) => {
      // we don't want to push in history if event is popstate
      if (eventType != "popstate") {
        w.history[eventType]({}, null, context.pathname)
      }
    },
  }
}
