import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/helpers/defaultTransitions"
import { Link, Router, Stack, useCreateRouter } from "@wbe/low-router-preact"

interface IProps {
  className?: string
  title: string
}

const componentName = "HomePage"
const log = debug(`front:${componentName}`)

/**
 * @name HomePage
 */
function HomePage(props: IProps, ref: MutableRefObject<any>) {
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

  const subRouter = useCreateRouter({ from: "home", id: "[home-sub]" })

  return (
    <div className={props.className} ref={rootRef}>
      {componentName} {props.title}
      <Router router={subRouter}>
        <div>
          <Link to={{ name: "home-sub-a" }}>home-sub-a</Link>
          <Link to={{ name: "home-sub-b" }}>home-sub-b</Link>
          <br />
          <Stack />
        </div>
      </Router>
    </div>
  )
}

export default forwardRef(HomePage)
