import gsap from "gsap"
import { Interpol } from "@wbe/interpol"

export const defaultTransitions = (el, duration = 500) => {
  const playInItp = new Interpol({
    el,
    paused: true,
    duration,
    props: {
      opacity: [() => parseFloat(el?.style.opacity || 0), 1],
    },
  })
  const playOutItp = new Interpol({
    el,
    paused: true,
    duration,
    props: {
      opacity: [() => parseFloat(el?.style.opacity || 1), 0],
    },
  })

  return {
    playIn: () => {
      playOutItp.stop()
      playInItp.refreshComputedValues()
      return playInItp.play()
    },
    playOut: () => {
      playInItp.stop()
      playOutItp.refreshComputedValues()
      return playOutItp.play()
    },
  }
}
