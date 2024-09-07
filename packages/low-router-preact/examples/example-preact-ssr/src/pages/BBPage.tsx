import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/helpers/defaultTransitions"
import { Link, Router, Stack, useCreateRouter } from "@wbe/low-router-preact"

interface IProps {
  className?: string
  title
}

const componentName = "BBPage"
const log = debug(`front:${componentName}`)

/**
 * @name BBPage
 */
function BBPage(props: IProps, ref: MutableRefObject<any>) {
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

  const subRouter = useCreateRouter({ from: "bb", id: "[bb-sub]" })

  return (
    <div className={props.className} ref={rootRef}>
      {componentName} {props.title}
      <Router router={subRouter}>
        <div>
          <Link to={{ name: "cc" }}>cc</Link>
          <Link to={{ name: "dd" }}>dd</Link>
          <Stack />
        </div>
      </Router>
    </div>
  )
}

export default forwardRef(BBPage)
