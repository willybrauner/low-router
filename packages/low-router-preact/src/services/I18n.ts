import debug from "@wbe/debug"
import { composeUrlByRouteName, joinPaths, ROUTERS } from ".."
import { isServer } from "@wbe/utils"
import { normalizePath, Route } from "@wbe/low-router"

const log = debug(`router:I18n`)

export type Locale<T = any> = {
  code: T | string
  name?: string
  default?: boolean
}

class I18n<T = any> {
  public locales: Locale<T>[]
  public currentLocale: Locale<T>
  public defaultLocale: Locale<T>
  public browserLocale: Locale<T>
  public defaultLocaleInUrl: boolean
  public base: string
  public staticLocation: string

  constructor(
    locales: Locale<T>[],
    options?: Partial<{
      base: string
      defaultLocaleInUrl: boolean
      staticLocation: string
    }>
  ) {
    this.locales = locales
    this.base = normalizePath(options.base ?? "/")
    this.staticLocation = options.staticLocation
    this.defaultLocale = this.#getDefaultLocale(locales)
    this.currentLocale = this.#getLocaleFromUrl() || this.defaultLocale
    this.browserLocale = this.#getBrowserLocale(locales)
    this.defaultLocaleInUrl = options.defaultLocaleInUrl ?? true
  }

  /**
   * Set new locale to URL
   * Use _fullUrl of last router instance (and not path), to manage locale as needed
   *
   *    ex:
   *      -> /base/locale/path     (with locale)
   *      -> /base/new-locale/path (with new locale)
   *      -> /base/path          (without locale)
   *
   *
   * Push new URL in history
   * @param toLocale
   * @param forcePageReload
   * @param routeContext
   */
  public setLocale(
    toLocale: Locale<T> | string,
    forcePageReload = true,
    routeContext = ROUTERS.currentContext
  ): void {
    if (typeof toLocale === "string") {
      toLocale = this.locales.find((locale) => locale.code === toLocale)
      if (!toLocale) {
        log(`locale code ${toLocale} is not available, exit.`)
        return
      }
    }

    if (toLocale.code === this.currentLocale.code) {
      log("this is the same locale, exit.")
      return
    }
    if (!this.#localeIsAvailable(toLocale)) {
      log(`locale ${toLocale.code} is not available in locales list, exit.`)
      return
    }

    // Translate routeContext URL to new locale URL
    // ex: /base/fr/path-fr/ -> /base/en/path-en/
    const composedUrl = composeUrlByRouteName(routeContext.route?.name, {
      ...(routeContext.params || {}),
      lang: toLocale.code as string,
    })
    log("composedUrl by routeName", composedUrl)

    let newUrl: string
    let chooseForcePageReload = forcePageReload

    // 1. if default locale should be always visible in URL
    if (this.defaultLocaleInUrl) {
      newUrl = composedUrl
    }

    // 2. if toLocale is default locale, need to REMOVE locale from URL
    else if (!this.defaultLocaleInUrl && this.isDefaultLocaleCode(toLocale.code)) {
      const baseAndLocale = `${this.base}/${toLocale.code}`
      const newUrlWithoutBaseAndLocale = composedUrl.substring(
        baseAndLocale.length,
        composedUrl.length
      )
      newUrl = joinPaths([this.base, newUrlWithoutBaseAndLocale])
      chooseForcePageReload = true
      log("2. after remove locale from URL", newUrl)
    }

    // 3. if current locale is default locale, add /currentLocale.code after base
    else if (!this.defaultLocaleInUrl && this.isDefaultLocaleCode(this.currentLocale.code)) {
      const newUrlWithoutBase = composedUrl.substring(this.base.length, composedUrl.length)
      newUrl = joinPaths([this.base, "/", toLocale.code as string, "/", newUrlWithoutBase])
      log("3. after add locale in URL", newUrl)
    }

    // 4. other cases
    else {
      newUrl = composedUrl
      log("4, other case")
    }

    // register current locale (not useful if we reload the app.)
    this.currentLocale = toLocale
    // remove last / if exist and if he is not alone
    newUrl = normalizePath(newUrl)
    // reload or refresh with new URL
    this.#reloadOrRefresh(newUrl, chooseForcePageReload)
  }

  /**
   * Redirect to browser locale
   * @param forcePageReload
   */
  public redirectToBrowserLocale(forcePageReload: boolean = true) {
    log("browserLocale object", this.browserLocale)
    // If browser locale doesn't match, redirect to default locale
    if (!this.browserLocale) {
      log("browserLocale is not set, redirect to defaultLocale")
      this.redirectToDefaultLocale(forcePageReload)
      return
    }
    // We want to redirect only in case user is on / or /base/
    if (location.pathname === this.base || normalizePath(location.pathname) === this.base) {
      // prepare path and build URL
      const newUrl = `${this.base}/${this.browserLocale.code}`
      log("redirect: to browser locale", newUrl)
      // reload or refresh all application
      this.#reloadOrRefresh(newUrl, forcePageReload)
    }
  }

  /**
   * Redirect to default locale if no locale is set
   * @param forcePageReload
   */
  public redirectToDefaultLocale(forcePageReload: boolean = true): void {
    if (!this.defaultLocaleInUrl) {
      log("redirect: URLs have a locale param or locale is valid, don't redirect.")
      return
    }
    if (this.#localeIsAvailable(this.#getLocaleFromUrl())) {
      log("redirect: locale from URL is valid, don't redirect")
      return
    }
    // We want to redirect only in case user is on / or /base/
    if (location.pathname === this.base || normalizePath(location.pathname) === this.base) {
      const newUrl = `${this.base}/${this.defaultLocale.code}`
      log("redirect to default locale >", newUrl)
      // reload or refresh all application
      this.#reloadOrRefresh(newUrl, forcePageReload)
    }
  }

  /**
   * Current locale is default locale
   */
  public isDefaultLocaleCode(code = this.currentLocale.code): boolean {
    return code === this.defaultLocale.code
  }

  /**
   * Show locale in URL
   */
  public showLocaleInUrl(): boolean {
    return this.defaultLocaleInUrl || !this.isDefaultLocaleCode(this.currentLocale.code)
  }
  /**
   * Add :lang param on path
   * @param pPath
   * @param showLocale
   */
  public patchLangParam(pPath: string, showLocale: boolean = this.showLocaleInUrl()): string {
    return normalizePath(
      joinPaths([showLocale && !pPath.includes("*") && "/:code", pPath !== "/" ? pPath : "/"])
    )
  }

  /**
   * Add Locale to Routes
   * Patch all first level routes with ":lang" param
   * { path: "/foo" } -> { path: "/:lang/foo" }
   * @param routes
   * @param showLocaleInUrl
   */
  public addLocaleParamToRoutes(
    routes: Route[],
    showLocaleInUrl = this.showLocaleInUrl()
  ): Route[] {
    /**
     * Patch routes
     *  - Add "/:lang" param on each 1st level route
     *  - format path recursively (on children if exist)
     * ex:
     *     {
     *      path: "/home"
     *      translations: { en: "/home", fr: "/accueil" }
     *     },
     *  return:
     *    {
     *      path: "/:lang/home",
     *      translations: { en: "/home", fr: "/accueil" },
     *      _path: "/home",
     *    }
     *
     */
    const patchRoutes = (pRoutes: Route[], children = false) => {
      return pRoutes.map((route: Route) => {
        const path = this.#getTranslatePathByLocale(route)
        const hasChildren = route.children?.length > 0
        const showLocale = !children && showLocaleInUrl

        let localePath = {}
        if (route.translations) {
          Object.keys(route.translations).forEach((locale) => {
            localePath[locale] = this.patchLangParam(route.translations[locale], showLocale)
          })
        }
        return {
          ...route,
          path: this.patchLangParam(path, showLocale),
          translations: Object.entries(localePath).length !== 0 ? localePath : null,
          ...(hasChildren ? { children: patchRoutes(route.children, true) } : {}),
        }
      })
    }

    return patchRoutes(routes)
  }

  // ----------------------------------------------------------------------------------------------- PRIVATE

  /**
   * Get current locale path translation by Locale
   * ex:
   * const route = {
   *     component: ...,
   *     path: "/about"  ---------> default locale
   *     translations: {
   *      en: "/about",  ---------> default locale, optional value
   *      fr: "/a-propos",
   * },
   *
   * getTranslatePathByLocale(route, "fr") // will return  "/a-propos"
   *
   */
  #getTranslatePathByLocale(
    route: Route,
    locale = this.#getLocaleFromUrl(this.staticLocation || window.location.pathname)?.code ||
      this.defaultLocale.code
  ): string {
    return route.translations ? route.translations?.[locale as string] ?? route.path : route.path
  }

  /**
   * Returns default locale of the list
   * If no default locale exist, it returns the first locale object of the locales array
   */
  #getDefaultLocale(locales: Locale<T>[]): Locale<T> {
    return locales.find((el) => el?.default) ?? locales[0]
  }

  /**
   * Get Browser locale
   */
  #getBrowserLocale(locales: Locale[]): Locale<T> {
    if (typeof navigator === "undefined") return
    const browserLocale = navigator.language
    log("Browser locale detected", browserLocale)
    return locales.find((locale) =>
      locale.code.includes("-")
        ? (locale.code as string) === browserLocale.toLowerCase()
        : (locale.code as string) === browserLocale.toLowerCase().split("-")[0]
    )
  }

  /**
   * Get current locale from URL
   */
  #getLocaleFromUrl(pathname = this.staticLocation || window.location.pathname): Locale<T> {
    let pathnameWithoutBase = pathname.replace(this.base, "/")
    const firstPart = joinPaths([pathnameWithoutBase]).split("/")[1]
    return this.locales.find((locale) => {
      return firstPart === locale.code
    })
  }

  /**
   * Check if locale is available in locale list
   */
  #localeIsAvailable(locale: Locale<T>, locales = this.locales): boolean {
    return locales.some((l) => l.code === locale?.code)
  }

  /**
   * Reload full page or refresh with router push
   */
  #reloadOrRefresh(url: string, forceReload = true, history = ROUTERS.history): void {
    forceReload ? !isServer() && window.open(url, "_self") : history.push(url)
  }
}

export { I18n }
