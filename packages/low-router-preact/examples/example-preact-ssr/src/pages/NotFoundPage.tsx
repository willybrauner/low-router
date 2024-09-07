import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/helpers/defaultTransitions"

interface IProps {
  title: string
}

const componentName = "NotFoundPage"
const log = debug(`front:${componentName}`)

/**
 * @name NotFoundPage
 */
function NotFoundPage(props: IProps, ref: MutableRefObject<any>) {
  const rootRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    componentName,
    playIn: () => defaultTransitions(rootRef.current).playIn(),
    playOut: () => defaultTransitions(rootRef.current).playOut(),
    root: rootRef.current,
  }))

  return (
    <div ref={rootRef}>
      {componentName} - {props.title}
    </div>
  )
}

export default forwardRef(NotFoundPage)
