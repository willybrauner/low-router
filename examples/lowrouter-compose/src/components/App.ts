import { RouteContext, Router } from "@wbe/lowrouter"
import { Home } from "../pages /Home.ts"
import { About } from "../pages /About.ts"
import { Contact } from "../pages /Contact.ts"
import {Component} from "../compose/Component.ts"


/**
 * Main App
 */
export class App {
  stackClass = "stack"
  linkClass = "link"
  stack: Element = document.querySelector(`.${this.stackClass}`)
  links: NodeListOf<Element>
  router: Router
  prevContext: RouteContext
  currContext: RouteContext
  isFirstRoute = true
  isAnimating = false

  /**
   * Start
   */
  constructor() {
    this.#createRouter()
    this.#updateLinks()
  }

  #createRouter(): void {
    this.router = new Router(
      [
        {
          path: "/",
          props: {
            component: Home,
          },
        },
        {
          path: "/about",
          props: {
            component: About,
          },
        },
        {
          path: "/contact",
          props: {
            component: Contact,
          },
        },
      ],
      {
        baseUrl: "/",
        debug: true,
        onUpdate: (ctx) => this.onRouteUpdate(ctx),
      }
    )
  }

  /**
   * Update
   *
   *
   */
  protected async onRouteUpdate(context: RouteContext): Promise<void> {
    this.prevContext = this.currContext
    this.currContext = context

    // TODO à faire ailleurs
    // prepare first instance
    if (this.isFirstRoute) {
      const stack = document.body.querySelector(`.${this.stackClass}`)
      const root = stack.querySelector(":scope > *")
      this.currContext.route.props.instance = new context.route.props.component(root)
    }

    if (this.isAnimating) {
      return
      // reject anim promise en cours?
      // keep only one div in stack?
      // await new Promise((resolve) => setTimeout(resolve, 1))
    }

    try {
      // fetch dom
      // TODO merge avec la method au dessus 'prepare first instance
      if (!this.isFirstRoute) {
        const fetchDom = await this.fetchDOM(context.pathname, new AbortController())
        const fetchStack = fetchDom.body.querySelector(`.${this.stackClass}`)
        const fetchRoot = fetchStack.querySelector(":scope > *")
        this.stack.appendChild(fetchRoot)
        context.route.props.instance = new context.route.props.component(
          fetchRoot
        )
      }

      // Transition...
      this.isAnimating = true
      await this.manageTransitions({
        prev: this.prevContext?.route.props.instance,
        curr: this.currContext.route.props.instance,
      })
    } catch (e) {
      console.error("preTransition error", e)
    }

    // then...
    this.#updateLinks()
    this.isFirstRoute = false
    this.isAnimating = false
    this.currContext = context
    console.log("updated !", { prevContext: this.prevContext, currContext: this.currContext })
  }

  public async manageTransitions({
    prev,
    curr,
  }: {
    prev: Component
    curr: Component
  }): Promise<void> {
    curr.root.style.opacity = "0"
    if (prev) {
      await prev.playOut()
      prev.root?.remove()
      prev._dangerousUnmounted()
    }
    console.log("curr", curr)
    await curr.playIn?.()
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
    else this.router.resolve(href)
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
   * @param url
   * @param controller
   * @protected
   */
  private isFetching = false
  protected async fetchDOM(url: string, controller: AbortController): Promise<Document> {
    if (this.isFetching) {
      controller.abort()
      this.isFetching = false
    }

    this.isFetching = true
    const response = await fetch(url, {
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
}
