import { getTranslate3DValues } from "./getTranslate3DValues.ts"
import gsap from "gsap"

export const defaultTransition = (el: HTMLElement) => {
  const translate3d = getTranslate3DValues(el)
  const { opacity: currOpacity } = window.getComputedStyle(el)

  console.log({ translate3d: translate3d?.y || 0, currOpacity })
  return {
    playIn: () => {
      return gsap.fromTo(
        el,
        {
          y: -innerHeight,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.6,
          ease: "power3.out",
        },
      )
    },
    playOut: () => {
      return gsap.to(el, {
        opacity: 0,
        y: innerHeight,
        duration: 1.6,
        ease: "power3.out",
      })
    },
  }
}
