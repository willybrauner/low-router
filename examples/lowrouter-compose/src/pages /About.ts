import { Component } from "../compose/Component.ts"
import {defaultTransition} from "../helpers/defaultTransition.ts"

export class About extends Component {
  transition = defaultTransition(this.root)
  async playIn() {
    return this.transition.playIn()
  }
  async playOut() {
    return this.transition.playOut()
  }
}
