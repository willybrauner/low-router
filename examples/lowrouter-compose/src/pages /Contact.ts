import {Component} from "../compose/Component.ts"
import {defaultTransition} from "../helpers/defaultTransition.ts"
import {setRandomBackgroundColor} from "../helpers/setRandomBackgroundColor.ts"

export class Contact extends Component {
  transition = defaultTransition(this.root)

  mounted() {
    setRandomBackgroundColor(this.root)
  }

  async playIn() {
    return this.transition.playIn()
  }
  async playOut() {
    return this.transition.playOut()
  }
}
