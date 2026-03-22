import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/src/helpers/defaultTransitions"

interface IProps {
  className?: string
  title: string
}

const componentName = "CCPage"

function CCPage(props: IProps, ref: MutableRefObject<any>) {
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

  return (
    <div className={props.className} ref={rootRef}>
      {componentName} {props.title}
    </div>
  )
}

export default forwardRef(CCPage)
