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
 * Create browser history
 */
export const createBrowserHistory: CreateBrowserHistory = () => {
  const w = window
  const h = history
  const loc = location
  // const keepPushState = h.pushState
  // const keepReplaceState = h.replaceState
  const listeners: ((location: Location, action: Action) => void)[] = []

  const notifyListeners = (location: Location, action: Action) => {
    listeners.forEach((callback) => {
      callback(location, action)
    })
  }

  return {
    listen: (callback: (location: Location, action: Action) => void) => {
      listeners.push(callback)

      const handlePop = () => {
        callback({ pathname: loc.pathname, search: loc.search, hash: loc.hash }, "POP")
      }

      // Handle the "popstate" event separately
      w.addEventListener("popstate", handlePop)

      return () => {
        // Remove the callback from the listeners array
        const index = listeners.indexOf(callback)
        if (index !== -1) listeners.splice(index, 1)
        w.removeEventListener("popstate", handlePop)
      }
    },
    push: (pathname: string, eventType: HistoryEvents = "pushState") => {
      h[eventType]({}, null, pathname)
      notifyListeners(
        { pathname, search: loc.search, hash: loc.hash },
        eventType === "pushState" ? "PUSH" : "REPLACE"
      )
    },
  }
}
