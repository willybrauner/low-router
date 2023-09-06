export const setRandomBackgroundColor = (el: HTMLElement): void => {
  el.style.background = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
    Math.random() * 255
  })`
}
