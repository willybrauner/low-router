import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/src/helpers/defaultTransitions"

const componentName = "AboutPage"

function AboutPage(props: { className?: string }, ref: MutableRefObject<any>) {
  const rootRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    playIn: () => defaultTransitions(rootRef.current).playIn(),
    playOut: () => defaultTransitions(rootRef.current).playOut(),
    root: rootRef.current,
    name: componentName,
  }))

  return <div ref={rootRef}>{componentName} — lazy loaded</div>
}

export default forwardRef(AboutPage)
