import { Component } from "@wbe/compose"
import { Interpol } from "@wbe/interpol"

export class Contact {
  root = document.querySelector<HTMLElement>(".Contact")
  playIn(_, resolve) {
    new Interpol({
      el: this.root,
      props: {
        opacity: [0, 1],
      },
      initUpdate: true,
      onComplete: resolve,
    })
  }
  playOut(_, resolve) {
    new Interpol({
      el: this.root,
      props: {
        opacity: [1, 0],
      },
      initUpdate: true,
      onComplete: resolve,
    })
  }
}
