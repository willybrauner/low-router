export type HistoryEvents = "pushState" | "replaceState" | "popstate" | "hashchange"

interface Location {
  pathname: string
  search: string
  hash: string
}
type Action = "POP" | "PUSH" | "REPLACE"

/**
 * Small browser history implementation
 * Creates a browser history object
 */
export const createBrowserHistory = () => {
  const w = window
  const h = history
  const keepPushState = history.pushState
  const keepReplaceState = history.replaceState

  return {
    listen: (cb: (location: Location, action: Action) => void) => {
      for (const type of ["pushState", "replaceState"]) {
        const original = history[type]
        history[type] = function () {
          const result = original.apply(this, arguments)
          const event = new Event(type)
          event["arguments"] = arguments
          dispatchEvent(event)
          // Determine the action type based on the event type
          const action: Action = type === "pushState" ? "PUSH" : "REPLACE"
          const location: Location = {
            pathname: w.location.pathname,
            search: w.location.search,
            hash: w.location.hash,
          }
          cb(location, action)
          return result
        }
      }

      const handlePop = () => {
        const location: Location = {
          pathname: w.location.pathname,
          search: w.location.search,
          hash: w.location.hash,
        }
        const action = "POP"
        cb(location, action)
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
