import { createBrowserHistory } from "@wbe/low-router"
import { createContext } from "react"

export const BrowserHistoryContext = createContext(null)
export const BrowserHistory = ({ children, browserHistory = createBrowserHistory() }) => {
  return <BrowserHistoryContext.Provider children={children} value={browserHistory} />
}
