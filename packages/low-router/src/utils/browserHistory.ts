export type HistoryEvents = "pushState" | "replaceState" | "popstate" | "hashchange"
type Action = "POP" | "PUSH" | "REPLACE"
interface Location {
  pathname: string
  search: string
  hash: string
}
export type CreateBrowserHistory = () => HistoryAPI

export interface callbackParams {
  location: Location
  action?: Action
}

export interface HistoryAPI {
  listen: (callback: ({ location, action }: callbackParams) => void) => () => void
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
  const listeners: (({ location, action }: callbackParams) => void)[] = []

  const notifyListeners = ({ location, action }: callbackParams) => {
    listeners.forEach((callback) => {
      callback({ location, action })
    })
  }

  return {
    listen: (callback: ({ location, action }: callbackParams) => void) => {
      listeners.push(callback)

      const handlePop = () => {
        callback({
          location: { pathname: loc.pathname, search: loc.search, hash: loc.hash },
          action: "POP",
        })
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
      notifyListeners({
        location: { pathname, search: loc.search, hash: loc.hash },
        action: eventType === "pushState" ? "PUSH" : "REPLACE",
      })
    },
  }
}
