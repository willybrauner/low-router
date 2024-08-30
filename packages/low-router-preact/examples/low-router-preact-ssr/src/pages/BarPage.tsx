import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/helpers/defaultTransitions"
import { Link, Router, Stack, useCreateRouter } from "@wbe/low-router-preact"

interface IProps {
  className?: string
}

const componentName = "BarPage"
const log = debug(`front:${componentName}`)

/**
 * @name BarPage
 */
function BarPage(props: IProps, ref: MutableRefObject<any>) {
  const rootRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      playIn: () => defaultTransitions(rootRef.current).playIn(),
      playOut: () => defaultTransitions(rootRef.current).playOut(),
      root: rootRef.current,
      name: componentName,
    }),
    [],
  )

  const subRouter = useCreateRouter({ from: "bar", id: "[bar-sub]" })

  return (
    <div className={props.className} ref={rootRef}>
      {componentName}
      {
        <Router router={subRouter}>
          <div>
            <Link to={{ name: "aa" }}>aa</Link>
            <Link to={{ name: "bb" }}>bb</Link>
            <Stack />
          </div>
        </Router>
      }
    </div>
  )
}

export default forwardRef(BarPage)
