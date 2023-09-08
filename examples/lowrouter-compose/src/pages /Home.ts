import { Component } from "../compose/Component.ts"
import {defaultTransition} from "../helpers/defaultTransition.ts"
import {Button} from "../components/Button.ts"

export class Home extends Component {

  public button = new Button(this.root.querySelector(".Button"))
  public transition = defaultTransition(this.root)


  mounted() {
    // add random rbg on root background
    this.root.style.background = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
  }

  async playIn() {
    return this.transition.playIn()
  }
  async playOut() {
    return this.transition.playOut()
  }
}
