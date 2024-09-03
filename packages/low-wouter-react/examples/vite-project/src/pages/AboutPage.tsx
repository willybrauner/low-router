import { forwardRef, useImperativeHandle, useRef } from "react"
import { defaultTransitions } from "../helpers/defaultTransitions.ts"

interface IProps {
  className?: string
}

const componentName = "AboutPage"

/**
 * @name AboutPage
 */
function AboutPage(props: IProps, ref: any) {
  const rootRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      playIn: () => defaultTransitions(rootRef.current).playIn(),
      playOut: () => defaultTransitions(rootRef.current).playOut(),
      root: rootRef.current,
      name: componentName,
    }),
    []
  )

  return (
    <div className={props.className} ref={rootRef}>
      {componentName}
    </div>
  )
}

export default forwardRef(AboutPage)
