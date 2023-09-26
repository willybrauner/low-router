export type HistoryEvents = "pushState" | "replaceState" | "popstate" | "hashchange"
type Action = "POP" | "PUSH" | "REPLACE"
interface Location {
  pathname: string
  search: string
  hash: string
}
export type CreateBrowserHistory = () => HistoryAPI
export interface HistoryAPI {
  listen: (callback: (location: Location, action: Action) => void) => () => void
  push: (pathname: string, eventType?: HistoryEvents) => void
}

/**
 * Small browser history implementation
 * Creates a browser history object
 */
export const createBrowserHistory: CreateBrowserHistory = () => {
  const w = window
  const h = history
  const loc = location
  const keepPushState = h.pushState
  const keepReplaceState = h.replaceState

  return {
    listen: (callback: (location: Location, action: Action) => void) => {
      for (const type of ["pushState", "replaceState"]) {
        const original = history[type]
        h[type] = function () {
          const result = original.apply(this, arguments)
          const event = new Event(type)
          event["arguments"] = arguments
          dispatchEvent(event)

          callback(
            { pathname: loc.pathname, search: loc.search, hash: loc.hash },
            type === "pushState" ? "PUSH" : "REPLACE"
          )
          return result
        }
      }

      const handlePop = (): void => {
        callback({ pathname: loc.pathname, search: loc.search, hash: loc.hash }, "POP")
      }
      // Handle the "popstate" event separately
      w.addEventListener("popstate", handlePop)

      return () => {
        h.pushState = keepPushState
        h.replaceState = keepReplaceState
        w.removeEventListener("popstate", handlePop)
      }
    },
    push: (pathname: string, eventType: HistoryEvents = "pushState") => {
      h[eventType]({}, null, pathname)
    },
  }
}
