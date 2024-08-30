import { Component } from "../compose/Component.ts"
import { defaultTransition } from "../helpers/defaultTransition.ts"

export class AboutFoo extends Component {
  transition = defaultTransition(this.root)

  mounted() {}

  async playIn() {
    return this.transition.playIn()
  }
  async playOut() {
    return this.transition.playOut()
  }
}
