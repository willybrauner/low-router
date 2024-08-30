import css from "./AboutPage.module.scss"
import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/helpers/defaultTransitions"
import { Link, Router, Stack, useCreateRouter } from "@wbe/low-router-preact"

interface IProps {
  className?: string
  title: string
}

const componentName = "AboutPage"
const log = debug(`front:${componentName}`)

/**
 * @name AboutPage
 */
function AboutPage(props: IProps, ref: MutableRefObject<any>) {
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
  const subRouter = useCreateRouter({ from: "about", id: "[about-sub]" })

  return (
    <div className={props.className} ref={rootRef}>
      {componentName} {props?.title}
      <Router router={subRouter}>
        <div>
          <Link to={{ name: "foo" }}>foo</Link>
          <Link to={{ name: "bar" }}>bar</Link>
          <Stack />
        </div>
      </Router>
    </div>
  )
}

export default forwardRef(AboutPage)
