export {
  useMemo,
  forwardRef,
  createElement,
  createContext,
  memo,
  useEffect,
  useReducer,
  useLayoutEffect,
  useContext,
} from "preact/compat"

export { useRef } from "preact/hooks"

// Conditional type alias to choose between React and Preact types
export type AnchorHTMLAttributes<T extends EventTarget> =
  | import("preact/compat").AnchorHTMLAttributes<T>
  | import("preact").JSX.HTMLAttributes<T>
export type MutableRefObject<T> = import("preact/compat").MutableRefObject<T> | { current: T }
export type PropsWithChildren<T> = T & { children?: preact.ComponentChildren }
export type ReactElement = import("preact/compat").ReactElement
