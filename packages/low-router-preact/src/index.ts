// components
export { Router, RouterContext, ROUTERS } from "./components/Router"
export type { IRouterContext } from "./components/Router"
export { Stack } from "./components/Stack"
export type { StackTransitionsParams } from "./components/Stack"
export { Link } from "./components/Link"

// hooks
export { useCreateRouter } from "./hooks/useCreateRouter"
export { useRouter } from "./hooks/useRouter"

// services
export { I18n } from "./services/I18n"
export type { Locale } from "./services/I18n"

// core
export { composeUrlByRouteName } from "./core/composeUrlByRouteName"
export { getStaticPropsFromUrl } from "./core/getStaticPropsFromUrl"
export type { InitialStaticProps } from "./core/getStaticPropsFromUrl"
export { setLocation } from "./core/setLocation"
export { useCache } from "./core/useCache"

// helpers
export { addLocaleToUrl } from "./helpers/addLocaleToUrl"
export { joinPaths } from "./helpers/joinPaths"
export { safeMergeObjects } from "./helpers/safeMergeObjects"
