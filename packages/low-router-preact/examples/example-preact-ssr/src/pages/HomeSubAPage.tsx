import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/src/helpers/defaultTransitions"

interface IProps {
  className?: string
}

function HomeSubAPage(props: IProps, ref: MutableRefObject<any>) {
  const rootRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      playIn: () => defaultTransitions(rootRef.current).playIn(),
      playOut: () => defaultTransitions(rootRef.current).playOut(),
      root: rootRef.current,
    }),
    [],
  )

  return (
    <div className={props.className} ref={rootRef}>
      HomeSubAPage
    </div>
  )
}

export default forwardRef(HomeSubAPage)
