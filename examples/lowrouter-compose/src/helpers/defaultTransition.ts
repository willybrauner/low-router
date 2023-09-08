import {Interpol} from "@wbe/interpol"

export const defaultTransition = (root:HTMLElement) =>
{
  const itp = new Interpol({
    paused: true,
    el: root,
    duration:700,
    ease: "power1.out",
    props: {
      opacity: [0, 1],
    },
  })
  return {
    playIn: ()=> itp.play(),
    playOut: ()=>itp.reverse()
  }

}
