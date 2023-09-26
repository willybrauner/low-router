export enum Action {
  Pop = "POP",
  Push = "PUSH",
  Replace = "REPLACE",
}

export type Pathname = string
export type Search = string
export type Hash = string
export type Key = string

export interface Path {
  pathname: Pathname
  search: Search
  hash: Hash
}

export interface Location extends Path {
  state: unknown
  key: Key
}

export interface Update {
  action: Action
  location: Location
}

export interface Listener {
  (update: Update): void
}

export interface Transition extends Update {
  retry(): void
}

export interface Blocker {
  (tx: Transition): void
}

export type To = string | Partial<Path>

export interface __history {
  readonly action: Action
  readonly location: Location
  createHref(to: To): string
  push(to: To, state?: any): void
  replace(to: To, state?: any): void
  go(delta: number): void
  back(): void
  forward(): void
  listen(listener: Listener): () => void
  block(blocker: Blocker): () => void
}

export interface BrowserHistory extends __history {}
const readOnly: <T>(obj: T) => Readonly<T> = (obj) => obj

function warning(cond: any, message: string) {
  if (!cond) {
    if (typeof console !== "undefined") console.warn(message)
    try {
      throw new Error(message)
    } catch (e) {}
  }
}

type HistoryState = {
  usr: any
  key?: string
  idx: number
}

const BeforeUnloadEventType = "beforeunload"
const HashChangeEventType = "hashchange"
const PopStateEventType = "popstate"

export type BrowserHistoryOptions = { window?: Window }

/**
 * Browser history stores the location in regular URLs. This is the standard for
 * most web apps, but it requires some configuration on the server to ensure you
 * serve the same app at multiple URLs.
 *
 */
export function createBrowserHistory(options: BrowserHistoryOptions = {}): BrowserHistory {
  let { window = document.defaultView! } = options
  let globalHistory = window.history

  function getIndexAndLocation(): [number, Location] {
    let { pathname, search, hash } = window.location
    let state = globalHistory.state || {}
    return [
      state.idx,
      readOnly<Location>({
        pathname,
        search,
        hash,
        state: state.usr || null,
        key: state.key || "default",
      }),
    ]
  }

  let blockedPopTx: Transition | null = null
  function handlePop() {
    if (blockedPopTx) {
      blockers.call(blockedPopTx)
      blockedPopTx = null
    } else {
      let nextAction = Action.Pop
      let [nextIndex, nextLocation] = getIndexAndLocation()

      if (blockers.length) {
        if (nextIndex != null) {
          let delta = index - nextIndex
          if (delta) {
            // Revert the POP
            blockedPopTx = {
              action: nextAction,
              location: nextLocation,
              retry() {
                go(delta * -1)
              },
            }

            go(delta)
          }
        } else {
          // Trying to POP to a location with no index. We did not create
          // this location, so we can't effectively block the navigation.
          warning(
            false,
            // detail and link to it here so people can understand better what
            // is going on and how to avoid it.
            `You are trying to block a POP navigation to a location that was not ` +
              `created by the history library. The block will fail silently in ` +
              `production, but in general you should do all navigation with the ` +
              `history library (instead of using window.history.pushState directly) ` +
              `to avoid this situation.`
          )
        }
      } else {
        applyTx(nextAction)
      }
    }
  }

  window.addEventListener(PopStateEventType, handlePop)

  let action = Action.Pop
  let [index, location] = getIndexAndLocation()
  let listeners = createEvents<Listener>()
  let blockers = createEvents<Blocker>()

  if (index == null) {
    index = 0
    globalHistory.replaceState({ ...globalHistory.state, idx: index }, "")
  }

  function createHref(to: To) {
    return typeof to === "string" ? to : createPath(to)
  }

  // state defaults to `null` because `window.history.state` does
  function getNextLocation(to: To, state: any = null): Location {
    return readOnly<Location>({
      pathname: location.pathname,
      hash: "",
      search: "",
      ...(typeof to === "string" ? parsePath(to) : to),
      state,
      key: createKey(),
    })
  }

  function getHistoryStateAndUrl(nextLocation: Location, index: number): [HistoryState, string] {
    return [
      {
        usr: nextLocation.state,
        key: nextLocation.key,
        idx: index,
      },
      createHref(nextLocation),
    ]
  }

  function allowTx(action: Action, location: Location, retry: () => void) {
    return !blockers.length || (blockers.call({ action, location, retry }), false)
  }

  function applyTx(nextAction: Action) {
    action = nextAction
    ;[index, location] = getIndexAndLocation()
    listeners.call({ action, location })
  }

  function push(to: To, state?: any) {
    let nextAction = Action.Push
    let nextLocation = getNextLocation(to, state)
    function retry() {
      push(to, state)
    }

    if (allowTx(nextAction, nextLocation, retry)) {
      let [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1)

      // TODO: Support forced reloading
      // try...catch because iOS limits us to 100 pushState calls :/
      try {
        globalHistory.pushState(historyState, "", url)
      } catch (error) {
        // They are going to lose state here, but there is no real
        // way to warn them about it since the page will refresh...
        window.location.assign(url)
      }

      applyTx(nextAction)
    }
  }

  function replace(to: To, state?: any) {
    let nextAction = Action.Replace
    let nextLocation = getNextLocation(to, state)
    function retry() {
      replace(to, state)
    }

    if (allowTx(nextAction, nextLocation, retry)) {
      let [historyState, url] = getHistoryStateAndUrl(nextLocation, index)

      // TODO: Support forced reloading
      globalHistory.replaceState(historyState, "", url)

      applyTx(nextAction)
    }
  }

  function go(delta: number) {
    globalHistory.go(delta)
  }

  let history: BrowserHistory = {
    get action() {
      return action
    },
    get location() {
      return location
    },
    createHref,
    push,
    replace,
    go,
    back() {
      go(-1)
    },
    forward() {
      go(1)
    },
    listen(listener) {
      return listeners.push(listener)
    },
    block(blocker) {
      let unblock = blockers.push(blocker)

      if (blockers.length === 1) {
        window.addEventListener(BeforeUnloadEventType, promptBeforeUnload)
      }

      return function () {
        unblock()

        // Remove the beforeunload listener so the document may
        // still be salvageable in the pagehide event.
        // See https://html.spec.whatwg.org/#unloading-documents
        if (!blockers.length) {
          window.removeEventListener(BeforeUnloadEventType, promptBeforeUnload)
        }
      }
    },
  }
  return history
}

function promptBeforeUnload(event: BeforeUnloadEvent) {
  // Cancel the event.
  event.preventDefault()
  // Chrome (and legacy IE) requires returnValue to be set.
  event.returnValue = ""
}

type Events<F> = {
  length: number
  push: (fn: F) => () => void
  call: (arg: any) => void
}

function createEvents<F extends Function>(): Events<F> {
  let handlers: F[] = []

  return {
    get length() {
      return handlers.length
    },
    push(fn: F) {
      handlers.push(fn)
      return function () {
        handlers = handlers.filter((handler) => handler !== fn)
      }
    },
    call(arg) {
      handlers.forEach((fn) => fn && fn(arg))
    },
  }
}

function createKey() {
  return Math.random().toString(36).substr(2, 8)
}

/**
 * Creates a string URL path from the given pathname, search, and hash components.
 *
 * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#createpath
 */
export function createPath({ pathname = "/", search = "", hash = "" }: Partial<Path>) {
  if (search && search !== "?") pathname += search.charAt(0) === "?" ? search : "?" + search
  if (hash && hash !== "#") pathname += hash.charAt(0) === "#" ? hash : "#" + hash
  return pathname
}

/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 *
 * @see https://github.com/remix-run/history/tree/main/docs/api-reference.md#parsepath
 */
export function parsePath(path: string): Partial<Path> {
  let parsedPath: Partial<Path> = {}

  if (path) {
    let hashIndex = path.indexOf("#")
    if (hashIndex >= 0) {
      parsedPath.hash = path.substr(hashIndex)
      path = path.substr(0, hashIndex)
    }

    let searchIndex = path.indexOf("?")
    if (searchIndex >= 0) {
      parsedPath.search = path.substr(searchIndex)
      path = path.substr(0, searchIndex)
    }

    if (path) {
      parsedPath.pathname = path
    }
  }

  return parsedPath
}
