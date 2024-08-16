export const normalizePath = (path: string): string =>
  path
    // remove multiples slashes
    ?.replace(/(https?:\/\/)|(\/)+/g, "$1$2")
    // remove trailing slash
    .replace(/\/$/, "") ||
  // add trailing slash if path is empty
  "/"
