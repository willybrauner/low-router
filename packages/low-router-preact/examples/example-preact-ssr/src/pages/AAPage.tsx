import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/helpers/defaultTransitions"
import { cls } from "@wbe/utils"

interface IProps {
  className?: string
}

const componentName = "AAPage"
const log = debug(`front:${componentName}`)

/**
 * @name AAPage
 */
function AAPage(props: IProps, ref: MutableRefObject<any>) {
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
    <div className={cls(props.className)} ref={rootRef}>
      {componentName}
    </div>
  )
}

export default forwardRef(AAPage)
