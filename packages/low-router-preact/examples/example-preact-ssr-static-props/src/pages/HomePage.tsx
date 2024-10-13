import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"

interface IProps {
  className?: string
  title: string
  content: string
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
      playIn: () => Promise.resolve(),
      playOut: () => Promise.resolve(),
      root: rootRef.current,
      name: componentName,
    }),
    [],
  )

  return (
    <div className={props.className} ref={rootRef}>
      {componentName} {props.title}

      <div>
        {props.content}
      </div>
    </div>
  )
}

export default forwardRef(HomePage)
