import { Interpol } from "@wbe/interpol"
import { getTranslate3DValues } from "./getTranslate3DValues.ts"
import gsap from "gsap"

export const defaultTransition = (el: HTMLElement) => {
  const paused = true
  const duration = 2000
  const translate3d = getTranslate3DValues(el)
  const { opacity: currOpacity } = window.getComputedStyle(el)

  console.log({ translate3d: translate3d?.y || 0, currOpacity })
  return {
    playIn: () => {
      return gsap.fromTo(
        el, {
          y: -innerHeight,
          opacity:0,
        },
        {
          y: 0,
          opacity:1,
          duration: 1.6,
          ease: "power3.out",
        }
      )

      // const itp = new Interpol({
      //   paused,
      //   el,
      //   duration,
      //   ease: "power3.inOut",
      //   props: {
      //     y: [-100, 0, "px"],
      //     opacity: [0, 1],
      //   },
      // })
      // return itp.play()
    },
    playOut: () => {

      return gsap.to(
        el,
        {
          opacity:0,
          y: innerHeight,
          duration: 1.6,
          ease: "power3.out",
        }
      )


      // const itp = new Interpol({
      //   el,
      //   duration,
      //   paused,
      //   ease: "power3.inOut",
      //   props: {
      //     y: [0, 100, "px"],
      //     opacity: [1, 0],
      //   },
      // })
      // return itp.play()
    },
  }
}
