import debug from "@wbe/debug"
const log = debug(`compose:Component`)

export type TProps = Record<string, any>
export const ID_ATTR = "data-id"
let ID = 0
export interface ComponentOptions {
  name: string
  props: TProps
}

/**
 * Component
 */
export class Component<Props = TProps> {
  public readonly root: HTMLElement
  public readonly name: string
  public readonly props: TProps
  public readonly id: number

  #observer: MutationObserver
  #isMounted: boolean = false
  public get isMounted() {
    return this.#isMounted
  }

  constructor(root: HTMLElement, options: Partial<ComponentOptions> = {}) {
    this.beforeMount()
    this.root = root
    this.name = options.name ?? this.root?.classList?.[0]
    this.props = options.props
    this.id = ID++
    this.root.setAttribute(ID_ATTR, `${this.id}`)

    // hack: exe init method with timeout to access `this` inside
    // the component witch extends Component
    window.setTimeout(() => {
      this.#mounted()
      this.#watchChildren()
    }, 0)
  }

  public beforeMount(): void {}

  public mounted(): void {}
  #mounted(): void {
    log("🟢 mounted", this.name)
    this.mounted()
    this.#isMounted = true
  }

  public unmounted() {}

  public _unmounted(): void {
    log("🔴 unmounted", this.name)
    this.unmounted()
    this.#isMounted = false
    this.#onChildrenComponents((component: Component) => {
      if (component) component._unmounted()
    })
  }

  // --------------------------------------------------------------------------- TRANSITIONS

  public playIn(): Promise<any | void> {
    return Promise.resolve()
  }

  public playOut(): Promise<any | void> {
    return Promise.resolve()
  }

  // --------------------------------------------------------------------------- CORE

  /**
   * Process callback function on each children components
   * A children component is an instance of Component
   * @param callback
   */
  #onChildrenComponents(callback: (component) => void): void {
    Object.keys(this)?.forEach((child) => {
      const curr = this?.[child]
      if (Array.isArray(curr)) {
        curr.forEach((c) => {
          if (c instanceof Component) callback(c)
        })
      } else if (curr instanceof Component) callback(curr)
    })
  }

  /**
   *  Watch children components changed
   *  If this current component is removed (with his children), unmount children
   */
  #watchChildren(): void {
    this.#observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        for (const node of mutation.removedNodes) {
          const nodeRemovedId = this.#getComponentId(node as any)
          const parentNode = node.parentNode?.querySelector(`*[${ID_ATTR}='${nodeRemovedId}']`)
          if (nodeRemovedId && parentNode) continue

          this.#onChildrenComponents((component) => {
            if (!component) return
            if (nodeRemovedId === component?.id && component?.isMounted) {
              component._unmounted()
              component.observer.disconnect()
            }
          })
        }
      }
    })

    if (this.root) {
      this.#observer.observe(this.root, {
        subtree: true,
        childList: true,
      })
    }
  }

  /**
   * Get component ID
   * @param $node
   */
  #getComponentId($node: HTMLElement): number {
    return $node?.getAttribute?.(ID_ATTR) && parseInt($node.getAttribute(ID_ATTR))
  }
}
