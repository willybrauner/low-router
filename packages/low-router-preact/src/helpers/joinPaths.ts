/**
 * Join string paths array
 * @param paths
 * @param join
 */
export function joinPaths(paths: string[], join: string = ""): string {
  return paths
    ?.filter(Boolean)
    .join(join)
    .replace(/(https?:\/\/)|(\/)+/g, "$1$2")
}
