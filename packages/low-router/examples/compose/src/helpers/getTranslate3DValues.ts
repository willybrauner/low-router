export function getTranslate3DValues(
  element: HTMLElement
): { x: number; y: number; z: number } | null {
  if (!element) return null

  const style = element.style

  const transformValue = null
  if (transformValue) {
    const matches = transformValue.match(/translate3d\(([^,]+),([^,]+),([^)]+)\)/)
    if (matches) {
      const x = parseFloat(matches[1])
      const y = parseFloat(matches[2])
      const z = parseFloat(matches[3])
      return { x, y, z }
    }
  }
}
