import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"

interface IProps {
  className?: string
  title: string
  content: string
}

function HomePage(props: IProps, ref: MutableRefObject<any>) {
  const rootRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      playIn: () => Promise.resolve(),
      playOut: () => Promise.resolve(),
      root: rootRef.current,
    }),
    [],
  )

  return (
    <div className={props.className} ref={rootRef}>
      HomePage {props.title}
      <div>{props.content}</div>
    </div>
  )
}

export default forwardRef(HomePage)
