import { createBrowserHistory, RouteContext, Router } from "@wbe/low-router"
import { Home } from "../pages /Home.ts"
import { About } from "../pages /About.ts"
import { Contact } from "../pages /Contact.ts"

/**
 * Main App
 */
export class App {
  stackClass = "stack"
  linkClass = "link"
  stack: HTMLElement = document.querySelector(`.${this.stackClass}`)
  links: NodeListOf<HTMLElement>
  router: Router
  currContext: RouteContext
  contexts: RouteContext[] = []
  isFirstRoute = true
  isAnimating = false
  browserHistory = createBrowserHistory()
  /**
   * Start
   */
  constructor() {
    this.#createRouter()
    this.#updateLinks()
    this.keyBoardNavigation()

    // implement a history listener
    // each time the history change, the router will resolve the new location
    const handleHistory = (location, action?): void => {
      this.router.resolve(location.pathname + location.search + location.hash)
    }
    // first call to resolve the current location
    handleHistory({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    })
    // listen to history and return the unlisten function
    const unlisten = this.browserHistory.listen(handleHistory)
  }

  #createRouter(): void {
    this.router = new Router(
      [
        {
          path: "/",
          action: () => Home,
        },
        {
          path: "/about",
          action: () => About,
        },
        {
          path: "/contact",
          action: () => Contact,
        },
      ],
      {
        base: "/",
        debug: true,
        onResolve: (ctx) => this.onRouteResolve(ctx),
      }
    )
  }

  /**
   * on Route Update
   * Will be fired on each route change, first route included
   *
   */
  protected async onRouteResolve(context: RouteContext): Promise<void> {
    if (context.pathname === this.currContext?.pathname) return
    this.currContext = context
    this.contexts.push(this.currContext)

    // then...
    if (this.isAnimating) {
      // reject anim promise en cours?
      // keep only one div in stack?
      await new Promise((resolve) => setTimeout(resolve, 1))
    }

    try {
      // fetch dom
      const doc = this.isFirstRoute ? document : await this.fetchDOM(context.pathname)
      const stack = doc.body.querySelector(`.${this.stackClass}`)
      const root = stack.querySelector(":scope > *")
      this.stack.appendChild(root)
      const instance = context.route.action(context)
      if (!context.route.props) context.route.props = {}
      context.route.props.instance = new instance(root)

      // Transition...
      this.isAnimating = true
      const prevContext = this.contexts[this.contexts.length - 2]
      await this.manageTransitions(prevContext, this.currContext)

      // remove prev context from array
      const index = this.contexts.indexOf(prevContext)
      if (index > -1) this.contexts.splice(index, 1)
    } catch (e) {
      console.error("preTransition error", e)
    }

    // then...
    this.#updateLinks()
    this.isFirstRoute = false
    this.isAnimating = false
  }

  public async manageTransitions(
    prevContext: RouteContext,
    currContext: RouteContext
  ): Promise<void> {
    const prevInstance = prevContext?.route.props.instance
    const currInstance = currContext.route.props.instance

    currInstance.root.style.opacity = "0"
    prevInstance?.playOut().then(() => {
      prevInstance.root.remove()
      prevInstance._unmounted()
    })
    await currInstance.playIn?.()
  }

  /**
   * Links
   */
  #listenLinks(): void {
    for (let link of this.links) {
      link.addEventListener("click", this.#handleLinks)
    }
  }
  #unlistenLinks(): void {
    for (let link of this.links) {
      link?.removeEventListener("click", this.#handleLinks)
    }
  }
  #handleLinks = (e): void => {
    e.preventDefault()
    const href: string = e.currentTarget.getAttribute("href")
    if (!href) console.error("No href attribute found on link", e.currentTarget)
    else {
      this.browserHistory.push(href)
    }
  }
  #updateLinks(): void {
    if (this.links) this.#unlistenLinks()
    this.links = document.querySelectorAll(`.${this.linkClass}`)
    if (this.links) this.#listenLinks()
  }

  // -----------
  // FETCH
  // -----------
  /**
   * Fetch new document from specific URL
   * @param pathname
   * @param controller
   * @protected
   */
  private isFetching = false
  protected async fetchDOM(
    pathname: string,
    controller: AbortController = new AbortController()
  ): Promise<Document> {
    if (this.isFetching) {
      controller.abort()
      this.isFetching = false
    }
    this.isFetching = true
    const response = await fetch(pathname, {
      signal: controller.signal,
      method: "GET",
    })
    if (response.status >= 200 && response.status < 300) {
      const html = await response.text()
      this.isFetching = false
      return typeof html === "string" ? new DOMParser().parseFromString(html, "text/html") : html
    }
    this.isFetching = false
  }

  /**
   * For testing a quick route changed
   * Add keydown event listener to navigate with arrows
   *
   */
  index = 0
  keyBoardNavigation() {
    const modulo = (base: number, modulo: number): number => ((base % modulo) + modulo) % modulo
    window.onkeydown = (e) => {
      if (e.key === "ArrowLeft") this.index = modulo(this.index - 1, this.links.length)
      if (e.key === "ArrowRight") this.index = modulo(this.index + 1, this.links.length)
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        this.browserHistory.push(Array.from(this.links)[this.index].getAttribute("href"))
      }
    }
  }
}
