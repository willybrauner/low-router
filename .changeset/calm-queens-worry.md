---
"@wbe/low-router": minor
"@wbe/low-router-preact": minor
---

Add compilePath as constructor option

- Make `compilePath` configurable via `RouterOptions`, following the same pattern as `matcher`
- Align internal `compilePath` regex with `pathToRegexp` to support all param modifiers (`?`, `+`, `*`)
- Export `CompilePath` type for custom implementations
- Fix the path-to-regexp example

## Usage

Swap the built-in compile function with any lib that shares the same signature:

```ts
import { compile } from "path-to-regexp"

const router = new LowRouter(routes, {
  matcher: customMatcher,
  compilePath: compile,
})
```

Catch-all / 404 route:

```ts
const routes = [
  { path: "/home", name: "home" },
  { path: "/:path*", name: "notFound" },
]

router.matchRoute("/unknown")
// → { params: { path: "unknown" }, route: { name: "notFound" } }
```
