import { forwardRef, useImperativeHandle, useRef } from "react"
import { defaultTransitions } from "../helpers/defaultTransitions.ts"

interface IProps {
  className?: string
}

const componentName = "HomePage"

/**
 * @name HomePage
 */
function HomePage(props: IProps, ref: any) {
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
  console.log('HomePage', rootRef.current)

  return (
    <div className={props.className} ref={rootRef}>
      {componentName}
    </div>
  )
}

export default forwardRef(HomePage)
