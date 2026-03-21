---
"@wbe/low-router-preact": minor
---

Add suspense API support to be able to load lazy routes

```ts
import { lazy } from "preact/compat"

const routes = [
  {
    name: "home",
    path: "/",
    action: () => lazy(() => import("./Home")),
  },
  {
    name: "about",
    path: "/about",
    action: () => lazy(() => import("./About")),
  },
]
```

Others changes:

- Add Stack `as` props
- Add Stack `className` props
- Breaking change: Remove the "Stack" string className from the root of `Stack` component
