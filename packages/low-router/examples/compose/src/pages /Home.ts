import { Component } from "../compose/Component.ts"
import { defaultTransition } from "../helpers/defaultTransition.ts"
import { Button } from "../components/Button.ts"
import {setRandomBackgroundColor} from "../helpers/setRandomBackgroundColor.ts"

export class Home extends Component {
  public button = new Button(this.root.querySelector(".Button"))
  public transition = defaultTransition(this.root)

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
