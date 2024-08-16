---
"@wbe/low-router": minor
---

nomalize path

Create normalize path helper to get a formatted and constant path format.
```ts
  path
    // remove multiples slashes
    ?.replace(/(https?:\/\/)|(\/)+/g, "$1$2")
    // remove trailing slash
    .replace(/\/$/, "") ||
  // add trailing slash if path is empty
  "/"

```

`normalizePath(path) => string` is available : `import { normalizePath } from "@wbe/low-router`
