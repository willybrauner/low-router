import { Interpol } from "@wbe/interpol"

export const defaultTransitions = (el, duration = 500) => {
  const playInItp = new Interpol({
    paused: true,
    duration,
    opacity: [() => parseFloat(el?.style.opacity || 0), 1],
    onUpdate: ({ opacity }) => {
      if (el) el.style.opacity = `${opacity}`
    },
  })
  const playOutItp = new Interpol({
    paused: true,
    duration,
    opacity: [() => parseFloat(el?.style.opacity || 1), 0],
    onUpdate: ({ opacity }) => {
      if (el) el.style.opacity = `${opacity}`
    },
  })

  return {
    playIn: () => {
      playOutItp.stop()
      playInItp.refresh()
      return playInItp.play()
    },
    playOut: () => {
      playInItp.stop()
      playOutItp.refresh()
      return playOutItp.play()
    },
  }
}
