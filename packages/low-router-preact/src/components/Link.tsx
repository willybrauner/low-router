import { h } from "preact"
import {
  AnchorHTMLAttributes,
  MutableRefObject,
  PropsWithChildren,
  useMemo,
  forwardRef,
  ReactElement,
} from "preact/compat"
import { normalizePath, RouteParams } from "@wbe/low-router"
import { useRouter } from "../hooks/useRouter"
import { joinPaths } from "../helpers/joinPaths"
import { ROUTERS } from "./Router"
import { addLocaleToUrl } from "../helpers/addLocaleToUrl"
import { composeUrlByRouteName } from "../core/composeUrlByRouteName"
import { isServer } from "@wbe/utils"

// exclude href because it collides with "to"
type TAnchorWithoutHref = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">

export interface ILinkProps extends PropsWithChildren<TAnchorWithoutHref> {
  to: string | { name: string; params?: RouteParams }
  onClick?: () => void
  className?: string
  children
}
function Link(props: ILinkProps, ref: MutableRefObject<any>): ReactElement {
  const { router, history, staticLocation, currentContext, i18n } = useRouter()

  const url = useMemo(() => {
    return typeof props.to === "string"
      ? normalizePath(joinPaths([ROUTERS.base, addLocaleToUrl(props.to)]))
      : composeUrlByRouteName(props.to.name, {
          code: i18n?.currentLocale?.code,
          ...props.to.params,
        })
  }, [props.to, router])

  const click = (e: Event) => {
    e.preventDefault()
    props.onClick?.()
    history?.push(url)
  }

  const isActive = useMemo(() => {
    const location = isServer() ? staticLocation : currentContext?.pathname
    return location === url || location === normalizePath(url)
  }, [staticLocation, currentContext, url])

  return (
    <a
      {...{ ...props, to: undefined }}
      className={joinPaths(["Link", props.className, isActive && "active"], " ")}
      children={props.children}
      onClick={click}
      href={url}
      ref={ref}
    />
  )
}

const ForwardLink = forwardRef(Link)
export { ForwardLink as Link }