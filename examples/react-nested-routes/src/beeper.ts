type THandler<S> = (state?: S) => void
type THandlers<S> = (THandler<S> | void)[]
type TOff<S> = (handler: THandler<S>) => void
export type Beeper<S = any> = {
  off: TOff<S>
  on: (handler: THandler<S>) => void
  dispatch: (state?: S) => THandlers<S>
  clear: () => void
  resetState: () => void
  get state(): S
  get handlers(): THandlers<S>
  get initialState(): S
}

/**
 * Beeper
 */
export function beeper<S = any>(initialState: S = null): Beeper<S> {
  let handlers: THandlers<S> = []
  let _initialState = initialState
  let currentState: S = initialState

  const off = (handler: THandler<S>): void => {
    handlers = handlers.filter((e) => e !== handler)
  }

  const on = (handler: THandler<S>): TOff<S> => {
    handlers.push(handler)
    return () => off(handler)
  }

  const dispatch = (state?: S): THandlers<S> => {
    currentState = state
    return handlers.map((e: THandler<S>) => e(state))
  }

  const clear = (): void => {
    handlers = []
  }

  const resetState = (): void => {
    currentState = _initialState
  }

  return {
    off,
    on,
    dispatch,
    clear,
    resetState,
    get state() {
      return currentState
    },
    get handlers() {
      return handlers
    },
    get initialState() {
      return _initialState
    },
  }
}
