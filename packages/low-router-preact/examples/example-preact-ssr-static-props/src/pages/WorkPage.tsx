import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { useRouter } from "@wbe/low-router-preact"

interface IProps {
  className?: string
  params: { id: string }
  data: {title:string}
  hash: string
  query: string
}

const componentName = "WorkPage"
const log = debug(`front:${componentName}`)

/**
 * @name WorkPage
 */
function WorkPage(props: IProps, ref: MutableRefObject<any>) {
  const rootRef = useRef<HTMLDivElement>(null)

  const { i18n } = useRouter()

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
      {i18n.currentLocale.code === "en" ? "work" : "projet"} {props.params.id} {props.data?.title}
    </div>
  )
}

export default forwardRef(WorkPage)
