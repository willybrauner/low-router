import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"

interface IProps {
  className?: string
  params: { id: string }
  data: { title: string }
}

function WorkPage(props: IProps, ref: MutableRefObject<any>) {
  const rootRef = useRef<HTMLDivElement>(null)

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
      WorkPage {props.params.id} {props.data?.title}
    </div>
  )
}

export default forwardRef(WorkPage)
