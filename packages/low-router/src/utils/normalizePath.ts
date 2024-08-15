export const normalizePath = (path: string): string =>
  path
    // remove multiples slashes
    .replace(/(\/)+/g, "/")
    // remove trailing slash
    .replace(/\/$/, "") ||
  // add trailing slash if path is empty
  "/"
