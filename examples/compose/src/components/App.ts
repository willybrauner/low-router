import { historyPlugin, RouteContext, Router } from "@wbe/low-router"
import { Home } from "../pages /Home.ts"
import { About } from "../pages /About.ts"
import { Contact } from "../pages /Contact.ts"
import { Component } from "../compose/Component.ts"

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

  /**
   * Start
   */
  constructor() {
    this.#createRouter()
    this.#updateLinks()
    this.keyBoardNavigation()
  }

  #createRouter(): void {
    this.router = new Router(
      [
        {
          path: "/",
          props: {
            foo: "bar",
          },
          action: (context) => Home,
        },
        {
          path: "/about",
          action: (context) => About,
        },
        {
          path: "/contact",
          action: (context) => Contact,
        },
      ],
      {
        base: "/",
        debug: true,
        plugins: [historyPlugin],
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
    const href: string = e.currentTarget.getAttribute("href") + "#test"
    if (!href) console.error("No href attribute found on link", e.currentTarget)
    else
      this.router.resolve(href).then((res) => {
        console.log("click: current action:", res)
      })
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

  // TEMP!!!
  // TEMP!!!
  // TEMP!!!
  // TEMP!!!
  // TEMP!!!
  // TEMP!!!
  linkIndex = 0
  #modulo(base: number, modulo: number): number {
    return ((base % modulo) + modulo) % modulo
  }
  keyBoardNavigation() {
    window.onkeydown = (e) => {
      if (e.key === "ArrowLeft")
        this.linkIndex = this.#modulo(this.linkIndex - 1, this.links.length)
      if (e.key === "ArrowRight")
        this.linkIndex = this.#modulo(this.linkIndex + 1, this.links.length)
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const k = Array.from(this.links)
        this.router.resolve(k[this.linkIndex].getAttribute("href"))
      }
    }
  }
}
