import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/src/helpers/defaultTransitions"

const componentName = "WorkPage"

function WorkPage(props: { params?: { id: string } }, ref: MutableRefObject<any>) {
  const rootRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    playIn: () => defaultTransitions(rootRef.current).playIn(),
    playOut: () => defaultTransitions(rootRef.current).playOut(),
    root: rootRef.current,
    name: componentName,
  }))

  return (
    <div ref={rootRef}>
      {componentName} — id: {props.params?.id}
    </div>
  )
}

export default forwardRef(WorkPage)
