import debug from "@wbe/debug"
import { useImperativeHandle, useRef } from "preact/hooks"
import { MutableRefObject, forwardRef } from "preact/compat"
import { defaultTransitions } from "~/helpers/defaultTransitions"
import { useRouter } from "@wbe/low-router-preact"

interface IProps {
  className?: string
  params: { id: string }
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
      playIn: () => defaultTransitions(rootRef.current).playIn(),
      playOut: () => defaultTransitions(rootRef.current).playOut(),
      root: rootRef.current,
      name: componentName,
    }),
    [],
  )
  return (
    <div className={props.className} ref={rootRef}>
      {i18n.currentLocale.code === "en" ? "work" : "projet"} {props.params?.id}
    </div>
  )
}

export default forwardRef(WorkPage)
