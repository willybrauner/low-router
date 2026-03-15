import { Interpol, styles } from "@wbe/interpol"
import debug from "@wbe/debug"
const log = debug("front:defaultTransitions")

export const defaultTransitions = (el, duration = 500) => {
  const playInItp = new Interpol({
    paused: true,
    duration,
    opacity: [() => parseFloat(el?.style.opacity || 0), 1],
    onUpdate: ({ opacity }) => {
      styles(el, { opacity })
    },
  })
  const playOutItp = new Interpol({
    paused: true,
    duration,
    opacity: [() => parseFloat(el?.style.opacity || 1), 0],
    onUpdate: ({ opacity }) => {
      styles(el, { opacity })
    },
  })

  return {
    playIn: () => {
      log("playIn")
      playOutItp.stop()
      playInItp.refresh()
      return playInItp.play()
    },
    playOut: () => {
      log("playOut")
      playInItp.stop()
      playOutItp.refresh()
      return playOutItp.play()
    },
  }
}
