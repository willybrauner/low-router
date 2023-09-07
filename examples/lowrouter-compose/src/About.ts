import { Interpol } from "@wbe/interpol"

export class About {
  root: HTMLElement

  constructor(root: HTMLElement) {
    this.root = root
  }
  async playIn() {
    const itp = new Interpol({
      paused: true,
      initUpdate: true,
      el: this.root,
      props: {
        opacity: [0, 1],
      },
    })
    await itp.play()
  }
  async playOut() {
    const itp = new Interpol({
      paused: true,
      initUpdate: true,
      el: this.root,
      props: {
        opacity: [1, 0],
      },
    })
    await itp.play()
  }
}
