/**
 * Safe merge objects together
 * @param rest objects to merge
 */
export function safeMergeObjects(...rest: Record<any, any>[]): Record<any, any> {
  return rest.reduce(
    (a, b) => ({
      ...a,
      ...(b || {}),
    }),
    {},
  )
}
